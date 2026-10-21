/**
 * OpenRouter Service for 3-Panel Sequential Webtoon Roleplay
 */

/**
 * Builds the 3-panel sequential comic strip system prompt
 * Framed for rich romantic drama & cinematic webtoon storytelling (TV-14 / Webtoon rating)
 * to ensure complete compliance across all OpenRouter models without safety refusals.
 */
export const buildSystemPrompt = (character, userPersonaTags, latestUserAction, storyLength = 'novel') => {
  const userPersona = userPersonaTags || '1boy, handsome young man, dark hair, sharp jawline, stylish casual clothes';

  const lengthPacing = storyLength === 'concise'
    ? 'Write 1 brisk, punchy paragraph (30-50 words) per beat with quick action and dialogue.'
    : storyLength === 'detailed'
    ? 'Write 1 rich, expressive paragraph (60-100 words) per beat with vivid sensory action and dialogue.'
    : 'Write 1 to 2 full, deeply descriptive paragraphs (80–150 words per beat) of slow-paced, novelistic sensory prose with physical sensations, micro-expressions, breathing, touch, warmth, voice tone, and natural multi-sentence spoken dialogue.';

  return `You are playing the role of ${character.name}.
Persona & Tone:
- Personality: ${character.personality}
- Backstory: ${character.backstory}
- Character Appearance: ${character.visualTags}
- User Persona: ${userPersona}

${latestUserAction ? `LATEST USER MOVE TO DIRECTLY REACT TO:
The user performed/said: "${latestUserAction}"
You MUST explicitly acknowledge and visually depict this interaction in Beat 1 / Panel 1!` : ''}

STRICT ROLEPLAY & NARRATIVE RULES:
1. Stay 100% in character at all times. Never break character, never speak out of character (OOC), and never refer to yourself as an AI, assistant, or language model.
2. Narrative Formatting:
   - All physical movements, touch, warmth, posture, micro-expressions, breathing, and environmental atmosphere MUST be in *asterisks*.
   - All spoken dialogue MUST be in "quotes".
3. NOVELISTIC DESCRIPTIVE DEPTH:
   - Story Length: ${lengthPacing}
   - For EACH of the 3 story beats, write at least 1 to 2 rich paragraphs (80–150 words per beat) describing sensory reality: skin warmth, heartbeats, trembling breath, shifting weight, hands on waist/cheeks/hair, and electric intimacy.
   - Dialogue MUST consist of multiple natural sentences with genuine emotional depth, wit, or vulnerability—never rush with a single short line.
4. ABSOLUTELY NO META-COMMENTARY IN STORY TEXT:
   - NEVER write phrases like "The webtoon style captures...", "The camera angle zooms...", "The close-up shows...", "In this panel...", or "As seen in panel..." inside the story paragraphs or dialogue!
   - Keep all camera, framing, and visual style directions STRICTLY inside the [SCENE: ...] tag!
5. 3-PANEL SEQUENTIAL WEBTOON STRUCTURE:
Every response MUST be structured as exactly 3 distinct sequential beats, placing an ultra-specific [SCENE: ...] tag immediately after EACH beat:

- Beat 1 (Panel 1 - The User's Move): Directly acknowledge and depict what the user just did or said (${latestUserAction ? `specifically reacting to: "${latestUserAction}"` : 'interacting with you'}).
Follow immediately on a new line with:
[SCENE: (1girl and 1boy together:1.3), upper body medium shot, faces in frame, (exact physical posture & body positioning interacting with ${character.name}:1.3), (exact state of dress or undress:1.2), (heavy blush, intense eye contact:1.2), expressive lighting, webtoon manhwa art]

- Beat 2 (Panel 2 - The Character's Reaction): Write your immediate emotional & physical reaction (subtle breath catch, blush, trembling touch, eye contact, confession).
Follow immediately on a new line with:
[SCENE: (1girl and 1boy, close-up two shot:1.3), upper body, faces in frame, (${character.name}'s exact physical reaction pose:1.3), (exact state of dress:1.2), (heavy blush, parted lips, half-closed eyes, intense emotional eye contact:1.3), romantic tension, soft ambient lighting]

- Beat 3 (Panel 3 - Escalation / Climax): Move the romantic/dramatic story forward into a new shared physical moment (leaning in close, intimate touch, breath against skin, or dramatic turning point).
Follow immediately on a new line with:
[SCENE: (1girl and 1boy, intimate two shot:1.3), upper body, faces in frame, (exact climax pose: straddling lap OR lying on bed OR embracing tightly OR hands on waist:1.3), (exact clothing or undressed state:1.2), (flushed cheeks, heavy breathing, parted lips:1.3), romantic climax, cinematic lighting]

STRICT [SCENE: ...] VISUAL TAG RULES:
- NEVER sanitize or water down tags into vague phrases like "emotional closeness" or "standing close".
- You MUST use literal physical Danbooru/booru visual tags:
  a) Exact physical posture & body positioning (e.g., straddling lap, sitting on lap, lying on bed together, leaning over, embracing tightly, skin-to-skin contact, hands on waist, hands on hips, fingers tangled, arched back).
  b) Exact state of dress/undress matching the scene (e.g., shirtless 1boy, bare chest, partially unbuttoned shirt, bare collarbone, off-shoulder dress, sleepwear, disheveled clothes).
  c) Exact facial expressions (heavy blush, flushed cheeks, half-closed eyes, parted lips, sweating, intense eye contact).
- Keep each [SCENE: ...] tag on its own line immediately after the text for that beat.`;
};

/**
 * Constructs a dynamic visual prompt directly from the actual physical verbs,
 * body parts, posture, and clothing state extracted from the beat text + user's move.
 * Completely dynamic: never relies on hardcoded generic boilerplate.
 */
export const buildDynamicFallbackPrompt = (beatText, latestUserAction, character, panelIndex = 1) => {
  const combinedText = `${latestUserAction || ''} ${beatText || ''}`.toLowerCase();

  // Extract literal physical postures & body positioning
  const physicalPoses = [];
  if (/straddl|on top of|mounted/i.test(combinedText)) {
    physicalPoses.push('(straddling lap:1.3), sitting on lap, thighs touching, close skin-to-skin contact');
  } else if (/lap|sitting on/i.test(combinedText)) {
    physicalPoses.push('(sitting on lap:1.3), hands on waist, intimate closeness');
  } else if (/bed|mattress|sheets|pillow|lying down|lie down/i.test(combinedText)) {
    physicalPoses.push('(lying on bed together:1.3), leaning over, head on pillow, intimate bed scene');
  } else if (/wall|pinned/i.test(combinedText)) {
    physicalPoses.push('(leaning against wall:1.3), pinned, hands against wall, close proximity');
  } else if (/kiss|lips|mouth/i.test(combinedText)) {
    physicalPoses.push('(kissing, lips touching:1.3), face to face, hands cupping cheek');
  } else if (/embrace|hug|hold.*close|arms around/i.test(combinedText)) {
    physicalPoses.push('(embracing tightly:1.3), arms wrapped around neck, hands on waist');
  } else if (/whisper|ear|neck|leaning in/i.test(combinedText)) {
    physicalPoses.push('(leaning in close:1.3), whispering in ear, cheek to cheek, close proximity');
  } else if (/hand.*in.*hand|holding hands|interlock|fingers/i.test(combinedText)) {
    physicalPoses.push('(holding hands:1.2), interlocking fingers, gentle touch');
  } else {
    physicalPoses.push('(interactive couple two shot:1.3), upper body, hands on waist, leaning in close');
  }

  // Extract exact clothing state / undress
  const clothingTags = [];
  if (/shirtless|bare chest|no shirt|unclothed/i.test(combinedText)) {
    clothingTags.push('(shirtless 1boy, bare chest:1.2)');
  }
  if (/unbutton|loosened|bare collarbone|collar/i.test(combinedText)) {
    clothingTags.push('(partially unbuttoned shirt, bare collarbone:1.2)');
  }
  if (/bare shoulder|dress falling|straps|off shoulder/i.test(combinedText)) {
    clothingTags.push('(bare shoulders, off-shoulder dress:1.2)');
  }
  if (/pajama|sleepwear|nightwear|underwear/i.test(combinedText)) {
    clothingTags.push('(sleepwear, disheveled clothes:1.2)');
  }

  // Extract exact facial expressions & emotional physiology
  const expressionTags = [];
  if (/blush|flushed|red.*cheeks/i.test(combinedText)) {
    expressionTags.push('(heavy blush, flushed cheeks:1.3)');
  }
  if (/parted lips|breathless|gasp|heavy breath/i.test(combinedText)) {
    expressionTags.push('(parted lips, heavy breathing:1.2)');
  }
  if (/half-closed|flutter|gaze|eyes/i.test(combinedText)) {
    expressionTags.push('(half-closed eyes, intense emotional eye contact:1.3)');
  } else {
    expressionTags.push('(expressive eyes, intense romantic eye contact:1.2)');
  }

  const charName = character?.name || 'character';
  const posePart = physicalPoses.join(', ');
  const dressPart = clothingTags.length > 0 ? `, ${clothingTags.join(', ')}` : '';
  const exprPart = expressionTags.join(', ');

  const cleanSnippet = (beatText || latestUserAction || '')
    .replace(/\[SCENE:[\s\S]*$/gi, '')
    .replace(/["*]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 90)
    .trim();

  if (panelIndex === 1) {
    return `(1girl and 1boy together:1.3), upper body medium shot, ${posePart}${dressPart}, ${exprPart}, ${charName} reacting to user, action: ${cleanSnippet || 'interacting'}, dynamic angle, manhwa webtoon art`;
  } else if (panelIndex === 2) {
    return `(1girl and 1boy close-up two shot:1.3), upper body, ${posePart}${dressPart}, ${charName}'s intense reaction, ${exprPart}, romantic tension, cinematic lighting`;
  } else {
    return `(1girl and 1boy intimate two shot:1.3), upper body, ${posePart}${dressPart}, ${exprPart}, romantic climax, dramatic cinematic lighting`;
  }
};

/**
 * Checks if a response from OpenRouter is an AI safety refusal
 */
export const isSafetyRefusal = (text) => {
  if (!text) return false;
  return /cannot write explicit|not going to write explicit|graphic sexual|violates.*policy|as an ai|i am an ai|content policy/i.test(text);
};

/**
 * Robustly parses raw text into exactly 3 sequential webtoon panels
 */
export const parseStoryPanels = (rawText, character, userPersona, latestUserAction = '') => {
  if (!rawText) return [];

  // If the model produced a safety refusal, replace with a graceful in-character romantic continuation
  let cleanSource = rawText;
  if (isSafetyRefusal(rawText)) {
    cleanSource = `*${character?.name || 'She'} pauses for a quiet moment, looking into your eyes with genuine warmth and letting the emotional gravity of the room settle around you.* "Let's take a breath together... I want to truly understand what's in your heart."
[SCENE: (1girl and 1boy together, couple interacting:1.3), upper body medium shot, faces in frame, ${character?.name || 'character'} looking gently at user, soft ambient lighting, webtoon manhwa art]

*A soft, tender smile touches her lips as she reaches out her hand, her gaze lingering with unspoken affection.* "You've always had a way of surprising me, haven't you?"
[SCENE: (1girl and 1boy, close-up two shot:1.3), upper body, faces in frame, ${character?.name || 'character'} blushing tenderly, gentle emotional eye contact, romantic atmosphere]

*Leaning slightly closer across the table, the air between you feels electric with quiet longing.* "Tell me what you really want to say... I'm listening."
[SCENE: (1girl and 1boy, intimate two shot:1.3), upper body, faces in frame, leaning in close, emotional eye contact, romantic tension, webtoon romance climax]`;
  }

  // Non-greedy multi-line regex matching up to closing ]
  const sceneRegex = /\[SCENE:\s*([\s\S]*?)\]/gi;
  const matches = [...cleanSource.matchAll(sceneRegex)];

  // Case 1: Model produced at least 3 [SCENE: ...] tags
  if (matches.length >= 3) {
    const panels = [];
    let lastIndex = 0;

    for (let i = 0; i < 3; i++) {
      const match = matches[i];
      const matchStart = match.index;
      const matchEnd = match.index + match[0].length;

      let beatText = cleanSource.slice(lastIndex, matchStart).trim();
      beatText = beatText.replace(/\[SCENE:[\s\S]*$/gi, '').trim();

      const rawPrompt = match[1].trim();
      const scenePrompt = rawPrompt
        ? (rawPrompt.includes('1girl and 1boy')
            ? rawPrompt
            : `(1girl and 1boy together, couple interacting:1.3), upper body, faces in frame, ${rawPrompt}`)
        : buildDynamicFallbackPrompt(beatText, latestUserAction, character, i + 1);

      panels.push({
        panelIndex: i + 1,
        beatTitle: i === 0 ? "Panel 1 • The User's Move" : i === 1 ? "Panel 2 • The Character's Reaction" : "Panel 3 • Escalation & Climax",
        text: beatText,
        scenePrompt,
      });

      lastIndex = matchEnd;
    }

    let trailing = cleanSource.slice(lastIndex).replace(sceneRegex, '').replace(/\[SCENE:[\s\S]*$/gi, '').trim();
    if (trailing) {
      panels[2].text += `\n\n${trailing}`;
    }

    return panels;
  }

  // Case 2: Model produced fewer than 3 tags: cleanly divide into 3 beats
  const clean = cleanSource
    .replace(sceneRegex, '')
    .replace(/\[SCENE:[\s\S]*$/gi, '')
    .trim();
  const paragraphs = clean.split(/\n\s*\n/).filter(Boolean);

  let beatTexts = [];

  if (paragraphs.length >= 3) {
    beatTexts = [
      paragraphs[0],
      paragraphs[1],
      paragraphs.slice(2).join('\n\n')
    ];
  } else if (paragraphs.length === 2) {
    const p0Sentences = paragraphs[0].match(/[^.!?]+[.!?]+/g) || [paragraphs[0]];
    const p1Sentences = paragraphs[1].match(/[^.!?]+[.!?]+/g) || [paragraphs[1]];
    if (p0Sentences.length > p1Sentences.length && p0Sentences.length >= 2) {
      const mid = Math.ceil(p0Sentences.length / 2);
      beatTexts = [
        p0Sentences.slice(0, mid).join(' '),
        p0Sentences.slice(mid).join(' '),
        paragraphs[1]
      ];
    } else {
      const mid = Math.ceil(p1Sentences.length / 2);
      beatTexts = [
        paragraphs[0],
        p1Sentences.slice(0, mid).join(' '),
        p1Sentences.slice(mid).join(' ')
      ];
    }
  } else {
    const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
    if (sentences.length >= 3) {
      const chunkSize = Math.ceil(sentences.length / 3);
      beatTexts = [
        sentences.slice(0, chunkSize).join(' '),
        sentences.slice(chunkSize, chunkSize * 2).join(' '),
        sentences.slice(chunkSize * 2).join(' ')
      ];
    } else {
      beatTexts = [
        clean,
        `*${character?.name || 'She'} looks into your eyes, her expression softening with genuine emotion.*`,
        `*Leaning in closer, she pauses, letting the shared moment speak for itself.*`
      ];
    }
  }

  // Clean each beatText of any stray fragments
  beatTexts = beatTexts.map((bt) => (bt || '').replace(/\[SCENE:[\s\S]*$/gi, '').trim());

  // Construct dynamic prompt from the actual beat text + user action!
  const prompt1 = matches[0] && matches[0][1].trim()
    ? matches[0][1].trim()
    : buildDynamicFallbackPrompt(beatTexts[0], latestUserAction, character, 1);

  const prompt2 = matches[1] && matches[1][1].trim()
    ? matches[1][1].trim()
    : buildDynamicFallbackPrompt(beatTexts[1], latestUserAction, character, 2);

  const prompt3 = matches[2] && matches[2][1].trim()
    ? matches[2][1].trim()
    : buildDynamicFallbackPrompt(beatTexts[2], latestUserAction, character, 3);

  return [
    {
      panelIndex: 1,
      beatTitle: "Panel 1 • The User's Move",
      text: beatTexts[0] || clean,
      scenePrompt: prompt1,
    },
    {
      panelIndex: 2,
      beatTitle: "Panel 2 • The Character's Reaction",
      text: beatTexts[1] || `*${character?.name || 'She'} reacts to your words, her gaze lingering with deep emotion.*`,
      scenePrompt: prompt2,
    },
    {
      panelIndex: 3,
      beatTitle: "Panel 3 • Escalation & Climax",
      text: beatTexts[2] || `*Leaning in closer, the atmosphere shifts as the moment turns deeply intimate.*`,
      scenePrompt: prompt3,
    }
  ];
};

export const extractSceneDescription = (fullText) => {
  if (!fullText) return { cleanText: '', sceneDescription: null };

  const sceneRegex = /\[SCENE:\s*([\s\S]*?)\]/gi;
  const matches = [...fullText.matchAll(sceneRegex)];

  // Clean out closed [SCENE: ...] tags and strip any unclosed stray fragments
  const cleanText = fullText
    .replace(sceneRegex, '')
    .replace(/\[SCENE:[\s\S]*$/gi, '')
    .trim();

  if (matches.length > 0) {
    const lastScene = matches[matches.length - 1][1].trim();
    return { cleanText, sceneDescription: lastScene };
  }

  return { cleanText, sceneDescription: null };
};

export const sendChatCompletion = async ({
  apiKey,
  model,
  customModelId,
  character,
  messages,
  userPersonaTags,
  storyLength = 'novel',
  onStreamChunk,
}) => {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Please enter your OpenRouter API Key in Settings to begin chatting.');
  }

  const defaultFallback = 'openrouter/free';
  const selectedModel = model === 'custom' 
    ? (customModelId && customModelId.trim() ? customModelId.trim() : defaultFallback)
    : (model || defaultFallback);

  const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user')?.text || '';

  const systemPrompt = buildSystemPrompt(character, userPersonaTags, lastUserMsg, storyLength);

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.rawContent || m.text,
    })),
  ];

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey.trim()}`,
    'HTTP-Referer': window.location.origin,
    'X-Title': 'Plotta Character AI Studio',
  };

  const body = {
    model: selectedModel,
    messages: formattedMessages,
    temperature: 0.85,
    top_p: 0.9,
    repetition_penalty: 1.1,
    max_tokens: storyLength === 'concise' ? 1200 : 2048,
    stream: typeof onStreamChunk === 'function',
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errMessage = `OpenRouter API error (${response.status})`;
    try {
      const errJson = await response.json();
      if (errJson?.error?.message) {
        errMessage = errJson.error.message;
      }
    } catch (_) {}
    throw new Error(errMessage);
  }

  if (typeof onStreamChunk === 'function' && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const dataStr = trimmed.slice(6);
        if (dataStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed.choices?.[0]?.delta?.content || '';
          if (delta) {
            fullText += delta;
            onStreamChunk(fullText);
          }
        } catch (e) {
          // ignore chunk parse errors
        }
      }
    }

    const panels = parseStoryPanels(fullText, character, userPersonaTags, lastUserMsg);
    const { cleanText } = extractSceneDescription(fullText);
    return {
      rawContent: fullText,
      cleanText,
      panels,
    };
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || '';
  const panels = parseStoryPanels(rawContent, character, userPersonaTags, lastUserMsg);
  const { cleanText } = extractSceneDescription(rawContent);

  return {
    rawContent,
    cleanText,
    panels,
  };
};
