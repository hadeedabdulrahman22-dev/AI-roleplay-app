import { DEFAULT_CHARACTERS } from '../data/defaultCharacters';

const SETTINGS_KEY = 'plotta_settings_v1';
const CHARACTERS_KEY = 'plotta_characters_v1';
const CHATS_PREFIX = 'plotta_chat_history_v1_';
const ACTIVE_CHAR_KEY = 'plotta_active_char_v1';

export const DEFAULT_SETTINGS = {
  openRouterApiKey: '',
  model: 'openrouter/free',
  customModelId: '',
  aiHordeApiKey: '0000000000',
  hordeModel: '',
  storyLength: 'novel',
  autoGenerateComic: true,
  userPersonaTags: '1boy, handsome young man, dark hair, sharp jawline, stylish casual clothes',
  allowNsfw: true,
};

export const STORY_LENGTH_OPTIONS = [
  {
    id: 'novel',
    name: 'Novel Mode (Long, Deeply Descriptive)',
    badge: 'Novel',
    description: 'Rich, novel-like prose with 1–2 descriptive paragraphs (80–150 words) per beat and natural multi-sentence dialogue.',
  },
  {
    id: 'detailed',
    name: 'Detailed Webtoon (Rich Paragraphs)',
    badge: 'Detailed',
    description: 'Vivid episodic webtoon narrative with expressive emotional reactions and full dialogue.',
  },
  {
    id: 'concise',
    name: 'Standard Comic (Concise)',
    badge: 'Concise',
    description: 'Brisk, punchy comic strip captions focused on rapid action and quick dialogue.',
  },
];

export const DEFAULT_HORDE_MODELS = [
  { id: '', name: 'Any Available Fast Worker (Fastest)', badge: 'Fastest' },
  { id: 'MeinaMix', name: 'MeinaMix (Anime / Manhwa Webtoon)', badge: 'Webtoon' },
  { id: 'Anything Diffusion', name: 'Anything Diffusion (Classic Anime)', badge: 'Anime' },
  { id: 'Dreamshaper', name: 'Dreamshaper (Cinematic Semi-Realistic)', badge: 'Cinematic' },
  { id: 'Counterfeit-V3.0', name: 'Counterfeit-V3.0 (Detailed Illustration)', badge: 'Detailed' },
  { id: 'custom', name: 'Custom Checkpoint Model...', badge: 'Custom' },
];

export const MODEL_OPTIONS = [
  {
    id: 'openrouter/free',
    name: 'openrouter/free (Auto Free Router)',
    badge: 'Auto Free',
    description: 'Automatically routes to the best currently available free model on OpenRouter.'
  },
  {
    id: 'google/gemma-4-31b-it:free',
    name: 'google/gemma-4-31b-it:free (Gemma 4 31B Roleplay)',
    badge: 'Expressive Free',
    description: 'Google’s latest conversational roleplay model with rich emotional nuance.'
  },
  {
    id: 'qwen/qwen3.8-27b:free',
    name: 'qwen/qwen3.8-27b:free (Qwen 3.8 27B)',
    badge: 'High-IQ Free',
    description: 'High-reasoning storytelling and descriptive dialogue generation.'
  },
  {
    id: 'nvidia/nemotron-3-super-120b-a12b:free',
    name: 'nvidia/nemotron-3-super-120b-a12b:free (Nemotron 120B)',
    badge: '120B Free',
    description: 'Massive scale storytelling with high depth, vocabulary, and consistency.'
  },
  {
    id: 'custom',
    name: 'Custom Model ID...',
    badge: 'Any Model',
    description: 'Enter any OpenRouter model identifier manually.'
  }
];

export const getStoredSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    const settings = { ...DEFAULT_SETTINGS, ...parsed };

    // Migrate old outdated default models to openrouter/free
    const validModelIds = MODEL_OPTIONS.map((m) => m.id);
    if (settings.model !== 'custom' && !validModelIds.includes(settings.model)) {
      settings.model = 'openrouter/free';
    }

    if (!settings.storyLength) {
      settings.storyLength = 'novel';
    }

    return settings;
  } catch (e) {
    console.error('Failed to load settings from localStorage', e);
    return DEFAULT_SETTINGS;
  }
};

export const saveStoredSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
};

export const getStoredCharacters = () => {
  try {
    const raw = localStorage.getItem(CHARACTERS_KEY);
    if (!raw) {
      localStorage.setItem(CHARACTERS_KEY, JSON.stringify(DEFAULT_CHARACTERS));
      return DEFAULT_CHARACTERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_CHARACTERS;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load characters', e);
    return DEFAULT_CHARACTERS;
  }
};

export const saveStoredCharacters = (characters) => {
  try {
    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
  } catch (e) {
    console.error('Failed to save characters', e);
  }
};

export const getActiveCharacterId = () => {
  try {
    const id = localStorage.getItem(ACTIVE_CHAR_KEY);
    if (id) return id;
    return DEFAULT_CHARACTERS[0].id;
  } catch (e) {
    return DEFAULT_CHARACTERS[0].id;
  }
};

export const saveActiveCharacterId = (id) => {
  try {
    localStorage.setItem(ACTIVE_CHAR_KEY, id);
  } catch (e) {
    console.error('Failed to save active char id', e);
  }
};

export const getStoredMessages = (characterId) => {
  try {
    const raw = localStorage.getItem(CHATS_PREFIX + characterId);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load chat history for', characterId, e);
    return null;
  }
};

export const saveStoredMessages = (characterId, messages) => {
  try {
    localStorage.setItem(CHATS_PREFIX + characterId, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat history', e);
  }
};

export const clearStoredMessages = (characterId) => {
  try {
    localStorage.removeItem(CHATS_PREFIX + characterId);
  } catch (e) {
    console.error('Failed to clear chat history', e);
  }
};
