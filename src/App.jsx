import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import SettingsModal from './components/SettingsModal';
import CharacterModal from './components/CharacterModal';
import ImageViewerModal from './components/ImageViewerModal';
import { 
  getStoredSettings, 
  saveStoredSettings, 
  getStoredCharacters, 
  saveStoredCharacters, 
  getActiveCharacterId, 
  saveActiveCharacterId, 
  getStoredMessages, 
  saveStoredMessages, 
  clearStoredMessages 
} from './services/storage';
import { DEFAULT_CHARACTERS } from './data/defaultCharacters';
import { sendChatCompletion, parseStoryPanels, extractSceneDescription, buildDynamicFallbackPrompt } from './services/openrouter';
import { initiateHordeGeneration, pollHordeStatus } from './services/aihorde';

export default function App() {
  // Persistent Settings
  const [settings, setSettings] = useState(() => getStoredSettings());
  
  // Persistent Characters
  const [characters, setCharacters] = useState(() => getStoredCharacters());
  const [activeCharacterId, setActiveCharacterId] = useState(() => getActiveCharacterId());

  // Active Character Object
  const activeCharacter = characters.find((c) => c.id === activeCharacterId) || characters[0];

  // Chat Messages for current character
  const [messages, setMessages] = useState([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);

  // UI Modals & Drawers
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [characterToEdit, setCharacterToEdit] = useState(null);

  // Fullscreen Image Viewer
  const [viewerImage, setViewerImage] = useState(null);

  // Active generation abort controllers by panel key: `${messageId}_${panelId}`
  const abortControllersRef = useRef({});

  // Synchronize active character change & load conversation
  useEffect(() => {
    if (!activeCharacter) return;
    saveActiveCharacterId(activeCharacter.id);

    const stored = getStoredMessages(activeCharacter.id);
    if (stored && stored.length > 0) {
      // Check if stored history is an old 1-panel greeting: migrate to full 3-panel sequential comic
      const isSingleOldGreeting = stored.length === 1 && stored[0].sender === 'ai' && (!stored[0].panels || stored[0].panels.length < 3);
      if (isSingleOldGreeting) {
        const fullGreetingPanels = parseStoryPanels(activeCharacter.greeting, activeCharacter, settings.userPersonaTags);
        const migratedGreeting = {
          id: `greeting_${activeCharacter.id}`,
          sender: 'ai',
          text: activeCharacter.greeting,
          rawContent: activeCharacter.greeting,
          timestamp: 'Just now',
          panels: fullGreetingPanels.map((p, i) => ({
            ...p,
            id: `greeting_${activeCharacter.id}_p${i + 1}`,
            imageUrl: null,
            isGeneratingImage: false,
            imageError: null,
          })),
        };
        setMessages([migratedGreeting]);
        saveStoredMessages(activeCharacter.id, [migratedGreeting]);
        if (settings.autoGenerateComic) {
          triggerAllPanels(migratedGreeting.id, migratedGreeting.panels, activeCharacter);
        }
      } else {
        setMessages(stored);
      }
    } else {
      // Initialize with full 3-panel sequential greeting
      const fullGreetingPanels = parseStoryPanels(activeCharacter.greeting, activeCharacter, settings.userPersonaTags);
      const initialGreetingMessage = {
        id: `greeting_${activeCharacter.id}`,
        sender: 'ai',
        text: activeCharacter.greeting,
        rawContent: activeCharacter.greeting,
        timestamp: 'Just now',
        panels: fullGreetingPanels.map((p, i) => ({
          ...p,
          id: `greeting_${activeCharacter.id}_p${i + 1}`,
          imageUrl: null,
          isGeneratingImage: false,
          imageError: null,
        })),
      };

      setMessages([initialGreetingMessage]);
      saveStoredMessages(activeCharacter.id, [initialGreetingMessage]);

      if (settings.autoGenerateComic) {
        triggerAllPanels(initialGreetingMessage.id, initialGreetingMessage.panels, activeCharacter);
      }
    }
  }, [activeCharacterId]);

  // Persist messages whenever they change
  useEffect(() => {
    if (activeCharacter?.id && messages.length > 0) {
      saveStoredMessages(activeCharacter.id, messages);
    }
  }, [messages, activeCharacter?.id]);

  // Save Settings
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const handleToggleAutoComic = () => {
    const updated = { ...settings, autoGenerateComic: !settings.autoGenerateComic };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  // Character Management
  const handleSelectCharacter = (id) => {
    setActiveCharacterId(id);
  };

  const handleOpenCreateCharacter = () => {
    setCharacterToEdit(null);
    setIsCharacterModalOpen(true);
  };

  const handleEditCharacter = (char) => {
    setCharacterToEdit(char);
    setIsCharacterModalOpen(true);
  };

  const handleSaveCharacter = (charData) => {
    let updated;
    const existingIndex = characters.findIndex((c) => c.id === charData.id);
    if (existingIndex >= 0) {
      updated = [...characters];
      updated[existingIndex] = charData;
    } else {
      updated = [charData, ...characters];
      setActiveCharacterId(charData.id);
    }

    setCharacters(updated);
    saveStoredCharacters(updated);
  };

  const handleDeleteCharacter = (id) => {
    const updated = characters.filter((c) => c.id !== id);
    if (updated.length > 0) {
      setCharacters(updated);
      saveStoredCharacters(updated);
      clearStoredMessages(id);
      if (activeCharacterId === id) {
        setActiveCharacterId(updated[0].id);
      }
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset character list to default demo characters? Your custom characters will be replaced.')) {
      setCharacters(DEFAULT_CHARACTERS);
      saveStoredCharacters(DEFAULT_CHARACTERS);
      setActiveCharacterId(DEFAULT_CHARACTERS[0].id);
      clearStoredMessages(DEFAULT_CHARACTERS[0].id);
      clearStoredMessages(DEFAULT_CHARACTERS[1].id);
    }
  };

  const handleClearHistory = () => {
    if (!activeCharacter) return;
    if (window.confirm(`Clear chat history with ${activeCharacter.name}?`)) {
      clearStoredMessages(activeCharacter.id);
      const fullGreetingPanels = parseStoryPanels(activeCharacter.greeting, activeCharacter, settings.userPersonaTags);
      const freshGreeting = {
        id: `greeting_${activeCharacter.id}_${Date.now()}`,
        sender: 'ai',
        text: activeCharacter.greeting,
        rawContent: activeCharacter.greeting,
        timestamp: 'Just now',
        panels: fullGreetingPanels.map((p, i) => ({
          ...p,
          id: `greeting_${activeCharacter.id}_p${i + 1}_${Date.now()}`,
          imageUrl: null,
          isGeneratingImage: false,
          imageError: null,
        })),
      };
      setMessages([freshGreeting]);
      saveStoredMessages(activeCharacter.id, [freshGreeting]);

      if (settings.autoGenerateComic) {
        triggerAllPanels(freshGreeting.id, freshGreeting.panels, activeCharacter);
      }
    }
  };

  /**
   * Generates a single panel via AI Horde (100% Uncensored, vertical 512x640 format)
   */
  const triggerSinglePanelGeneration = async (messageId, panelId, scenePrompt, character) => {
    const key = `${messageId}_${panelId}`;

    if (abortControllersRef.current[key]) {
      abortControllersRef.current[key].abort();
    }
    const controller = new AbortController();
    abortControllersRef.current[key] = controller;

    // Set panel state to loading
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const updatedPanels = (m.panels || []).map((p) =>
          (p.id === panelId || p.panelIndex === panelId)
            ? {
                ...p,
                isGeneratingImage: true,
                imageError: null,
                hordeProgress: { queuePosition: 0, waitTime: 0, isProcessing: false },
              }
            : p
        );
        return { ...m, panels: updatedPanels };
      })
    );

    try {
      // 1. Submit async generation to AI Horde with character & user persona tags
      const hordeId = await initiateHordeGeneration({
        apiKey: settings.aiHordeApiKey,
        characterVisualTags: character.visualTags,
        userPersonaTags: settings.userPersonaTags,
        sceneDescription: scenePrompt,
        allowNsfw: settings.allowNsfw !== false,
        model: settings.hordeModel,
        signal: controller.signal,
      });

      // 2. Poll every 3 seconds for progress
      const result = await pollHordeStatus(
        hordeId,
        (progress) => {
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== messageId) return m;
              const updatedPanels = (m.panels || []).map((p) =>
                (p.id === panelId || p.panelIndex === panelId)
                  ? { ...p, hordeProgress: progress }
                  : p
              );
              return { ...m, panels: updatedPanels };
            })
          );
        },
        controller.signal
      );

      // 3. Panel Generation complete!
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const updatedPanels = (m.panels || []).map((p) =>
            (p.id === panelId || p.panelIndex === panelId)
              ? {
                  ...p,
                  imageUrl: result.imageUrl,
                  imageModel: result.model,
                  isGeneratingImage: false,
                  imageError: null,
                }
              : p
          );
          return { ...m, panels: updatedPanels };
        })
      );
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error('Panel generation error:', err);
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const updatedPanels = (m.panels || []).map((p) =>
            (p.id === panelId || p.panelIndex === panelId)
              ? {
                  ...p,
                  isGeneratingImage: false,
                  imageError: err.message || 'Failed to render panel from AI Horde',
                }
              : p
          );
          return { ...m, panels: updatedPanels };
        })
      );
    } finally {
      delete abortControllersRef.current[key];
    }
  };

  /**
   * Triggers all 3 panels sequentially staggered by 700ms to stay strictly within AI Horde's 2 req/sec limit
   */
  const triggerAllPanels = async (messageId, panelsList, character) => {
    if (!Array.isArray(panelsList) || panelsList.length === 0) return;

    for (let i = 0; i < panelsList.length; i++) {
      const panel = panelsList[i];
      if (panel.scenePrompt) {
        triggerSinglePanelGeneration(messageId, panel.id, panel.scenePrompt, character);
        if (i < panelsList.length - 1) {
          await new Promise((r) => setTimeout(r, 700));
        }
      }
    }
  };

  // Send User Message & Receive AI 3-Panel Story Response
  const handleSendMessage = async (text) => {
    if (!text || isLoadingResponse) return;

    if (!settings.openRouterApiKey) {
      setIsSettingsOpen(true);
      return;
    }

    const userMessageId = `user_${Date.now()}`;
    const userMessage = {
      id: userMessageId,
      sender: 'user',
      text,
      rawContent: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const aiMessageId = `ai_${Date.now() + 1}`;
    const initialAiMessage = {
      id: aiMessageId,
      sender: 'ai',
      text: '',
      rawContent: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      panels: [],
      isStreaming: true,
    };

    const updatedMessages = [...messages, userMessage, initialAiMessage];
    setMessages(updatedMessages);
    setIsLoadingResponse(true);

    try {
      // Call OpenRouter with streaming
      const result = await sendChatCompletion({
        apiKey: settings.openRouterApiKey,
        model: settings.model,
        customModelId: settings.customModelId,
        character: activeCharacter,
        messages: [...messages, userMessage],
        userPersonaTags: settings.userPersonaTags,
        onStreamChunk: (streamedFullText) => {
          const livePanels = parseStoryPanels(streamedFullText, activeCharacter, settings.userPersonaTags, text);
          const { cleanText } = extractSceneDescription(streamedFullText);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMessageId
                ? {
                    ...m,
                    text: cleanText,
                    rawContent: streamedFullText,
                    panels: livePanels.map((p, i) => ({
                      ...p,
                      id: `${aiMessageId}_p${i + 1}`,
                      isGeneratingImage: false,
                    })),
                    isStreaming: true,
                  }
                : m
            )
          );
        },
      });

      // Stream complete: finalize message panels
      const finalizedPanels = result.panels.map((p, i) => ({
        ...p,
        id: `${aiMessageId}_p${i + 1}`,
        panelIndex: i + 1,
        imageUrl: null,
        isGeneratingImage: false,
        imageError: null,
      }));

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? {
                ...m,
                text: result.cleanText,
                rawContent: result.rawContent,
                panels: finalizedPanels,
                isStreaming: false,
              }
            : m
        )
      );

      // Trigger all 3 panels in parallel if autoGenerateComic is enabled
      if (settings.autoGenerateComic && finalizedPanels.length > 0) {
        triggerAllPanels(aiMessageId, finalizedPanels, activeCharacter);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? {
                ...m,
                text: `*(An error occurred: ${err.message})*`,
                panels: [
                  {
                    id: `${aiMessageId}_err`,
                    panelIndex: 1,
                    beatTitle: "Notice",
                    text: `*(An error occurred: ${err.message})*`,
                    scenePrompt: null,
                  }
                ],
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsLoadingResponse(false);
    }
  };

  // Continue Comic Story ➡️ handler
  const handleContinueStory = () => {
    const isRomantic = activeCharacter?.subtitle?.toLowerCase().includes('romance') || activeCharacter?.subtitle?.toLowerCase().includes('drama');
    const continuationText = isRomantic
      ? '*Leans in closer, meeting her gaze with unspoken emotion and letting the moment linger.* "What are you thinking right now...?"'
      : '*Takes a step forward, watching your companion carefully as the surrounding atmosphere shifts.* "What do we do now?"';

    handleSendMessage(continuationText);
  };

  // Regenerate Single Panel Handler (supports user-edited scene prompt)
  const handleRegeneratePanel = (messageId, panelId, customPrompt) => {
    const targetMsg = messages.find((m) => m.id === messageId);
    if (!targetMsg) return;

    const targetPanel = (targetMsg.panels || []).find(
      (p) => p.id === panelId || p.panelIndex === panelId
    );
    if (!targetPanel) return;

    let scenePrompt = customPrompt || targetPanel.scenePrompt;
    if (!scenePrompt) {
      const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user')?.text || '';
      scenePrompt = buildDynamicFallbackPrompt(targetPanel.text, lastUserMsg, activeCharacter, targetPanel.panelIndex);
    }

    if (customPrompt) {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          return {
            ...m,
            panels: (m.panels || []).map((p) =>
              (p.id === panelId || p.panelIndex === panelId)
                ? { ...p, scenePrompt: customPrompt }
                : p
            ),
          };
        })
      );
    }

    triggerSinglePanelGeneration(messageId, targetPanel.id || panelId, scenePrompt, activeCharacter);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0b0d14] text-slate-100 font-sans">
      {/* Top Header */}
      <Header
        activeCharacter={activeCharacter}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCreateCharacter={handleOpenCreateCharacter}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onResetChat={handleClearHistory}
        isSidebarOpen={isSidebarOpen}
        settings={settings}
      />

      {/* Main Container: Sidebar + Chat Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          characters={characters}
          activeCharacterId={activeCharacterId}
          onSelectCharacter={handleSelectCharacter}
          onOpenCreateCharacter={handleOpenCreateCharacter}
          onEditCharacter={handleEditCharacter}
          onDeleteCharacter={handleDeleteCharacter}
          onResetToDefaults={handleResetToDefaults}
          settings={settings}
        />

        <ChatArea
          character={activeCharacter}
          messages={messages}
          isLoadingResponse={isLoadingResponse}
          onSendMessage={handleSendMessage}
          onContinueStory={handleContinueStory}
          onRegeneratePanel={handleRegeneratePanel}
          onOpenImageViewer={(url, scene) => setViewerImage({ url, scene })}
          onEditCharacter={handleEditCharacter}
          onClearHistory={handleClearHistory}
          onOpenSettings={() => setIsSettingsOpen(true)}
          settings={settings}
          onToggleAutoComic={handleToggleAutoComic}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      {/* Character Creator & Editor Modal */}
      <CharacterModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        characterToEdit={characterToEdit}
        onSaveCharacter={handleSaveCharacter}
      />

      {/* Fullscreen Image Preview Modal */}
      <ImageViewerModal
        isOpen={!!viewerImage}
        onClose={() => setViewerImage(null)}
        imageUrl={viewerImage?.url}
        sceneDescription={viewerImage?.scene}
      />
    </div>
  );
}
