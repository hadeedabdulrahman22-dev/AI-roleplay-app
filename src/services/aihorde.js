/**
 * AI Horde Service for generating webtoon comic panels
 * API docs: https://aihorde.net/api/
 */

const DEFAULT_HORDE_KEY = '0000000000';
const HORDE_API_BASE = 'https://aihorde.net/api/v2';

/**
 * Builds the AI Horde prompt prioritizing the dynamic scene action first
 * so Stable Diffusion directly illustrates the user's move and character's response
 * while ensuring heads and faces are fully in frame (no decapitation/crop).
 */
export const buildPrompt = (characterVisualTags, userPersonaTags, sceneDescription) => {
  const qualityPrefix = 'masterpiece, best quality, korean webtoon style, manhwa romance art, dynamic composition, upper body, cowboy shot, head and shoulders visible, faces in frame, eye contact';
  const scenePart = sceneDescription ? sceneDescription.trim() : 'romantic couple interacting, emotional eye contact, webtoon romance scene';
  const charPart = characterVisualTags ? characterVisualTags.trim() : '';
  const userPart = userPersonaTags ? userPersonaTags.trim() : '1boy, handsome young man, dark hair, stylish clothes';

  // SCENE ACTION COMES FIRST right after style & framing so CLIP gives it highest weight
  const positivePrompt = `${qualityPrefix}, ${scenePart}, ${charPart}, ${userPart}`;

  // Strict anti-cropping negative prompt to prevent headless or cropped characters
  const negativePrompt = 'headless, cropped head, cut off head, out of frame head, missing head, decapitated, face out of frame, body out of frame, cut off at neck, zoomed in too close, bad anatomy, bad hands, stiff pose, boring portrait, passport photo, staring blankly at camera, deformed, extra limbs, text, watermark, censored';

  return `${positivePrompt} ### ${negativePrompt}`;
};

/**
 * Initiates an async image generation request on AI Horde
 * Optimized for fast queue times & vertical webtoon panel format:
 * - width: 512, height: 640 (vertical webtoon format)
 * - steps: 20, cfg_scale: 7
 * - nsfw: true, censor_nsfw: false (100% uncensored)
 * - No heavy model restrictions: any available fast worker picks up immediately
 */
export const initiateHordeGeneration = async ({
  apiKey,
  characterVisualTags,
  visualTags,
  userPersonaTags,
  sceneDescription,
  allowNsfw = true,
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
    // No specific model restrictions so any available fast worker picks up immediately
  };

  const response = await fetch(`${HORDE_API_BASE}/generate/async`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': hordeKey,
      'Client-Agent': 'PlottaCharacterAI:1.0:web-client',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorDetail = `AI Horde submission failed (${response.status})`;
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
 * Polls the generation status every 3 seconds until completed or failed
 * @param {string} generationId
 * @param {function} onProgress - callback receiving { queuePosition, waitTime, isProcessing }
 * @param {AbortSignal} signal - optional abort signal
 */
export const pollHordeStatus = async (generationId, onProgress, signal) => {
  const pollInterval = 3000;
  const maxAttempts = 80; // ~4 minutes maximum
  let attempts = 0;

  while (attempts < maxAttempts) {
    if (signal?.aborted) {
      throw new Error('Image generation was cancelled');
    }

    try {
      const res = await fetch(`${HORDE_API_BASE}/generate/status/${generationId}`, {
        headers: {
          'Client-Agent': 'PlottaCharacterAI:1.0:web-client',
        },
        signal,
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Generation job expired or not found on AI Horde');
        }
      } else {
        const statusData = await res.json();

        if (statusData.faulted) {
          throw new Error('AI Horde worker encountered an error generating this image');
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
        throw new Error('Generation cancelled');
      }
      console.warn('AI Horde polling glitch (will retry):', err);
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error('AI Horde request timed out after waiting in queue. Please try regenerating.');
};
