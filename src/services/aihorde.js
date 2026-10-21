/**
 * AI Horde Service for generating webtoon comic panels
 * API docs: https://aihorde.net/api/
 */

const DEFAULT_HORDE_KEY = '0000000000';
const HORDE_API_BASE = 'https://aihorde.net/api/v2';
const CLIENT_AGENT = 'PlottaCharacterAI:1.0:web-client';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Tells AI Horde to stop a job we no longer need (cancelled, timed out, or failed).
 * Best-effort: errors are ignored because this is only cleanup.
 */
export const cancelHordeGeneration = async (generationId) => {
  if (!generationId) return;
  try {
    await fetch(`${HORDE_API_BASE}/generate/status/${generationId}`, {
      method: 'DELETE',
      headers: { 'Client-Agent': CLIENT_AGENT },
    });
  } catch (_) {
    // ignore - cleanup only
  }
};

/**
 * Strips restrictive outer clothing words whenever the scene calls for intimacy,
 * bedroom settings, undressing, or close physical contact so the [SCENE: ...] tag
 * has full visual control over what the characters are wearing and doing.
 */
export const stripRestrictiveClothing = (tags, sceneDescription = '') => {
  if (!tags) return '';
  const sceneLower = (sceneDescription || '').toLowerCase();

  // Check if scene involves bedroom, bed, lap, skin, touch, kiss, undressing, or close physical contact
  const isIntimate = /undress|bed|lying|lap|straddl|skin|bare|shirtless|chest|cleavage|shoulder|naked|thigh|embrace|kiss|hug|intimat|touch|unbutton|sleepwear|morning|towel/i.test(sceneLower);

  if (!isIntimate) return tags;

  // Restrictive clothing terms to remove so they don't override the scene
  const clothingPattern = /\b(stylish casual clothes|casual clothes|formal clothes|business suit|suit and tie|suit|jacket|blazer|trenchcoat|coat|heavy coat|winter coat|formal dress|evening dress|cocktail dress|dress|leather jacket|uniform|armor|sweater|hoodie|boots|tie)\b/gi;

  return tags
    .replace(clothingPattern, '')
    .replace(/,\s*,+/g, ',')
    .replace(/^[\s,]+|[\s,]+$/g, '')
    .trim();
};

/**
 * Builds the AI Horde prompt prioritizing the dynamic scene action first:
 * masterpiece, best quality, korean webtoon art, expressive anatomy, dynamic angle, ${scenePrompt}, ${characterCoreFeatures}, ${userCoreFeatures}
 */
export const buildFullPrompt = (characterVisualTags, userPersonaTags, sceneDescription) => {
  const qualityPrefix = 'masterpiece, best quality, korean webtoon art, expressive anatomy, dynamic angle';
  const scenePrompt = sceneDescription ? sceneDescription.trim() : '1girl and 1boy together, intimate couple interacting, expressive faces, webtoon romance';

  // Strip restrictive clothing from character and user persona if the scene is intimate
  const characterCoreFeatures = stripRestrictiveClothing(characterVisualTags || '', scenePrompt);
  const userCoreFeatures = stripRestrictiveClothing(userPersonaTags || '', scenePrompt);

  const parts = [
    qualityPrefix,
    scenePrompt,
    characterCoreFeatures,
    userCoreFeatures,
  ].filter(Boolean);

  const positivePrompt = parts.join(', ');

  const negativePrompt = 'static standing portrait, formal clothes in bed, stiff posture, looking away, censored, headless, cropped head, cut off head, out of frame head, missing head, decapitated, face out of frame, body out of frame, cut off at neck, zoomed in too close, bad anatomy, bad hands, stiff pose, boring portrait, passport photo, staring blankly at camera, deformed, extra limbs, text, watermark';

  return `${positivePrompt} ### ${negativePrompt}`;
};

export const buildPrompt = buildFullPrompt;

/**
 * Initiates an async image generation request on AI Horde
 * Optimized for fast queue times & vertical webtoon panel format:
 * - width: 512, height: 640 (vertical webtoon format)
 * - steps: 20, cfg_scale: 7
 * - nsfw: true, censor_nsfw: false (100% uncensored)
 */
export const initiateHordeGeneration = async ({
  apiKey,
  characterVisualTags,
  visualTags,
  userPersonaTags,
  sceneDescription,
  allowNsfw = true,
  model = '',
  signal,
}) => {
  const hordeKey = apiKey && apiKey.trim() !== '' ? apiKey.trim() : DEFAULT_HORDE_KEY;
  const charTags = characterVisualTags || visualTags || '';
  const prompt = buildPrompt(charTags, userPersonaTags, sceneDescription);

  const payload = {
    prompt,
    params: {
      sampler_name: 'k_euler_a',
      cfg_scale: 7,
      denoising_strength: 0.75,
      seed: '-1',
      height: 640,
      width: 512,
      steps: 20,
      n: 1,
    },
    nsfw: allowNsfw !== false,
    censor_nsfw: !allowNsfw,
    r2: true, // Request direct R2 image CDN URL if available
    shared: false,
  };

  // If a specific model checkpoint is chosen, restrict to workers hosting that model
  if (model && model.trim() !== '' && model.trim().toLowerCase() !== 'any') {
    payload.models = [model.trim()];
  }

  // AI Horde rate limit: 2 requests per 1 second.
  // Retry loop with backoff if 429 or "2 per 1 second" occurs
  const maxTries = 5;
  let response;
  for (let attempt = 1; attempt <= maxTries; attempt++) {
    if (signal?.aborted) throw new Error('Image generation was cancelled');

    try {
      response = await fetch(`${HORDE_API_BASE}/generate/async`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': hordeKey,
          'Client-Agent': CLIENT_AGENT,
        },
        body: JSON.stringify(payload),
        signal,
      });
    } catch (err) {
      if (signal?.aborted) throw new Error('Image generation was cancelled');
      if (attempt === maxTries) throw err;
      await sleep(attempt * 1000);
      continue;
    }

    if (response.status === 429) {
      if (attempt < maxTries) {
        await sleep(attempt * 1500);
        continue;
      }
    }

    // Check for rate limit in body if status is not 200
    if (!response.ok) {
      try {
        const cloned = response.clone();
        const errJson = await cloned.json();
        const msg = (errJson?.message || '').toLowerCase();
        if ((msg.includes('2 per 1 second') || msg.includes('rate limit') || msg.includes('too many requests')) && attempt < maxTries) {
          await sleep(attempt * 1500);
          continue;
        }
      } catch (_) {}
    }

    break;
  }

  if (!response.ok) {
    let errorDetail = `AI Horde submission failed (${response.status})`;
    if (response.status === 429) {
      errorDetail = 'AI Horde rate limit reached (2 req/sec). Retrying momentarily...';
    }
    try {
      const errData = await response.json();
      if (errData?.message) {
        errorDetail = errData.message;
      }
    } catch (_) {}
    throw new Error(errorDetail);
  }

  const data = await response.json();
  if (!data?.id) {
    throw new Error('AI Horde did not return a valid generation ID');
  }

  return data.id;
};

/**
 * Polls the generation status every few seconds until completed or failed.
 * If the user cancels, or it fails/times out, the job is also cancelled on AI Horde.
 * @param {string} generationId
 * @param {function} onProgress - callback receiving { queuePosition, waitTime, isProcessing }
 * @param {AbortSignal} signal - optional abort signal
 */
export const pollHordeStatus = async (generationId, onProgress, signal) => {
  const pollInterval = 4000;
  const maxAttempts = 90; // ~6 minutes maximum
  let attempts = 0;

  // Errors that should stop polling immediately (not be retried)
  const fatal = (message) => {
    const err = new Error(message);
    err.fatal = true;
    return err;
  };

  while (attempts < maxAttempts) {
    if (signal?.aborted) {
      await cancelHordeGeneration(generationId);
      throw new Error('Image generation was cancelled');
    }

    try {
      const res = await fetch(`${HORDE_API_BASE}/generate/status/${generationId}`, {
        headers: { 'Client-Agent': CLIENT_AGENT },
        signal,
      });

      if (res.status === 404) {
        throw fatal('Generation job expired or not found on AI Horde');
      }

      if (res.ok) {
        const statusData = await res.json();

        if (statusData.faulted) {
          throw fatal('AI Horde worker encountered an error generating this image');
        }

        if (statusData.done && statusData.generations && statusData.generations.length > 0) {
          const gen = statusData.generations[0];
          let imageUrl = gen.img;

          if (imageUrl) {
            if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
              imageUrl = `data:image/webp;base64,${imageUrl}`;
            }
            return {
              imageUrl,
              model: gen.model || 'AI Horde Worker',
              seed: gen.seed,
            };
          }
        }

        if (typeof onProgress === 'function') {
          onProgress({
            queuePosition: statusData.queue_position ?? 0,
            waitTime: statusData.wait_time ?? 0,
            isProcessing: statusData.processing > 0,
            finished: statusData.finished,
            waiting: statusData.waiting,
          });
        }
      }
    } catch (err) {
      if (signal?.aborted) {
        await cancelHordeGeneration(generationId);
        throw new Error('Image generation was cancelled');
      }
      if (err.fatal) {
        throw err;
      }
      console.warn('AI Horde polling glitch (will retry):', err);
    }

    attempts++;
    await sleep(pollInterval);
  }

  await cancelHordeGeneration(generationId);
  throw new Error('AI Horde request timed out after waiting in queue. Please try regenerating.');
};
