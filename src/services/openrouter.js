/**
 * OpenRouter Service for 3-Panel Sequential Webtoon Roleplay
 */

/**
 * Builds the 3-panel sequential comic strip system prompt
 * Framed for rich romantic drama & cinematic webtoon storytelling (TV-14 / Webtoon rating)
 * to ensure complete compliance across all OpenRouter models without safety refusals.
 */
export const buildSystemPrompt = (character, userPersonaTags, latestUserAction) => {
  const userPersona = userPersonaTags || '1boy, handsome young man, dark hair, sharp jawline, stylish casual clothes';

  return `You are playing the role of ${character.name}.
Persona & Tone:
- Personality: ${character.personality}
- Backstory: ${character.backstory}
- Character Appearance: ${character.visualTags}
- User Persona: ${userPersona}

${latestUserAction ? `LATEST USER MOVE TO DIRECTLY REACT TO:
The user performed/said: "${latestUserAction}"
You MUST explicitly acknowledge and depict this interaction in Beat 1 / Panel 1!` : ''}

STRICT ROLEPLAY RULES:
1. Stay 100% in character at all times. Never break character, never speak out of character (OOC), and never refer to yourself as an AI, assistant, or language model.
2. Format all physical movements, gestures, subtle touches, and environmental interactions in *asterisks*. Spoken dialogue MUST be in quotes.
3. Content & Tone: Write captivating, emotionally rich romantic drama / fantasy adventure in the style of popular published webtoons and manhwa. Focus on deep emotional connection, romantic tension, yearning gazes, witty banter, and dramatic character chemistry. Do not output graphic or explicit anatomical acts.
4. 3-PANEL SEQUENTIAL WEBTOON COMIC STRIP STRUCTURE:
Every response MUST be structured as exactly 3 distinct story beats, placing a dynamic [SCENE: ...] tag immediately after EACH beat:

- Beat 1 (Panel 1 - The User's Move): Directly acknowledge and depict what the user just did or said (${latestUserAction ? `specifically reacting to: "${latestUserAction}"` : 'interacting with you'}). Follow immediately with:
[SCENE: (1girl and 1boy together, couple interacting:1.3), upper body medium shot, head and shoulders visible, faces in frame, (visually depict user's move interacting with ${character.name}:1.3), looking at each other, detailed anime faces, expressive lighting, webtoon manhwa style]

- Beat 2 (Panel 2 - The Character's Reaction): Write your immediate emotional & physical reaction (subtle breath catch, blush, eye contact, trembling smile, or confession). Follow immediately with:
[SCENE: (1girl and 1boy, close-up two shot:1.3), upper body, faces in frame, (${character.name}'s intense facial expression, blushing cheeks, emotional eye contact:1.3), romantic tension, soft ambient lighting]

- Beat 3 (Panel 3 - Escalation / Climax): Move the romantic/dramatic story forward into a new shared moment (leaning in close, gentle touch, shared laughter, whispered words, or dramatic turning point). Follow immediately with:
[SCENE: (1girl and 1boy, intimate two shot:1.3), upper body, faces in frame, (new emotional pose, leaning in close, shared touch:1.3), dramatic romantic climax, cinematic bokeh]

CRITICAL PROMPT RULES:
- NEVER write boring, static solo descriptions like "girl sitting" or "girl standing".
- Every [SCENE: ...] tag MUST contain: (1girl and 1boy together:1.3), upper body or close-up framing, exact interaction pose, eye contact, and emotional facial expressions.
- Keep each [SCENE: ...] tag on its own line immediately after the text for that beat.`;
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

  const userActionClean = latestUserAction
    ? latestUserAction.replace(/\*/g, '').slice(0, 80).trim()
    : 'interacting with each other';

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

      const beatText = cleanSource.slice(lastIndex, matchStart).trim();
      const rawPrompt = match[1].trim();

      const scenePrompt = rawPrompt.includes('1girl and 1boy')
        ? rawPrompt
        : `(1girl and 1boy together, couple interacting:1.3), upper body, faces in frame, ${rawPrompt}`;

      panels.push({
        panelIndex: i + 1,
        beatTitle: i === 0 ? "Panel 1 • The User's Move" : i === 1 ? "Panel 2 • The Character's Reaction" : "Panel 3 • Escalation & Climax",
        text: beatText,
        scenePrompt,
      });

      lastIndex = matchEnd;
    }

    const trailing = cleanSource.slice(lastIndex).replace(sceneRegex, '').trim();
    if (trailing) {
      panels[2].text += `\n\n${trailing}`;
    }

    return panels;
  }

  // Case 2: Model produced fewer than 3 tags: cleanly divide into 3 beats
  const clean = cleanSource.replace(/\[SCENE:\s*[\s\S]*?\]/gi, '').trim();
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

  const prompt1 = matches[0]
    ? matches[0][1].trim()
    : `(1girl and 1boy together, couple interacting:1.3), upper body medium shot, head and shoulders visible, faces in frame, (${character?.name || 'character'} acknowledging user: ${userActionClean}:1.3), eye contact, romantic webtoon manhwa art`;

  const prompt2 = matches[1]
    ? matches[1][1].trim()
    : `(1girl and 1boy, close-up two shot:1.3), upper body, faces in frame, (${character?.name || 'character'} blushing cheeks, emotional vulnerable gaze, eye contact:1.3), soft romantic lighting, dramatic tension`;

  const prompt3 = matches[2]
    ? matches[2][1].trim()
    : `(1girl and 1boy, intimate two shot:1.3), upper body, faces in frame, (leaning in close, gentle touch, emotional closeness:1.3), atmospheric bokeh, webtoon romance climax`;

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

  if (matches.length > 0) {
    const cleanText = fullText.replace(sceneRegex, '').trim();
    const lastScene = matches[matches.length - 1][1].trim();
    return { cleanText, sceneDescription: lastScene };
  }

  return { cleanText: fullText.trim(), sceneDescription: null };
};

export const sendChatCompletion = async ({
  apiKey,
  model,
  customModelId,
  character,
  messages,
  userPersonaTags,
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

  const systemPrompt = buildSystemPrompt(character, userPersonaTags, lastUserMsg);

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
    max_tokens: 1200,
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
