import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  ArrowDown, 
  Trash2, 
  Edit3, 
  Image as ImageIcon,
  Key,
  Flame,
  HeartHandshake,
  FastForward
} from 'lucide-react';
import ChatMessage from './ChatMessage';

export default function ChatArea({
  character,
  messages,
  isLoadingResponse,
  onSendMessage,
  onContinueStory,
  onRegeneratePanel,
  onOpenImageViewer,
  onEditCharacter,
  onClearHistory,
  onOpenSettings,
  settings,
  onToggleAutoComic,
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Auto-scroll to bottom on new messages or generation progress
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isLoadingResponse]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isFarUp = el.scrollHeight - el.scrollTop - el.clientHeight > 200;
    setShowScrollBottom(isFarUp);
  };

  const handleSend = () => {
    if (!inputText.trim() || isLoadingResponse) return;
    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  const isRomantic = character?.subtitle?.toLowerCase().includes('romance') || character?.subtitle?.toLowerCase().includes('drama');

  const suggestionPrompts = isRomantic ? [
    '*Smiles softly and sits down across from her*',
    '*Looks into her eyes* "I never forgot about you either."',
    '*Gently reaches out to touch her hand*',
    '*Takes a sip of his drink and pauses* "What happened back then?"',
  ] : [
    '*Draws blade and grins* "Lead the way, I\'ve got your back."',
    '*Steps past the archway to examine the glowing runes*',
    '*Chuckles* "You were always too eager to charge into danger."',
    '*Prepares a protective ward and scans the darkness*',
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0c13] overflow-hidden relative">
      {/* Missing API Key Alert Banner */}
      {!settings.openRouterApiKey && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-amber-950/80 via-purple-950/70 to-amber-950/80 border-b border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400 shrink-0" />
            <span>OpenRouter API Key needed to start generating AI character responses.</span>
          </div>
          <button
            onClick={onOpenSettings}
            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 border border-amber-500/40 rounded-lg font-semibold transition-colors shrink-0"
          >
            Enter Key
          </button>
        </div>
      )}

      {/* Character Profile Sub-header */}
      <div className="px-4 py-2.5 border-b border-white/5 bg-[#0e111a]/70 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <img
            src={character?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={character?.name}
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-purple-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide">
                {character?.name}
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25">
                {character?.subtitle || 'Roleplay'}
              </span>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/25 font-mono">
                3-Panel Webtoon
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-sm sm:max-w-md hidden sm:block">
              {character?.personality}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEditCharacter(character)}
            title="Edit Character"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={onClearHistory}
            title="Clear Chat History"
            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
      >
        {/* Welcome Character Card */}
        {character && (
          <div className="max-w-xl mx-auto my-3 p-5 rounded-2xl bg-gradient-to-b from-[#141824] to-[#0e111b] border border-white/10 text-center shadow-xl">
            <div className="relative inline-block mb-3">
              <img
                src={character.avatar}
                alt={character.name}
                className="w-20 h-20 rounded-2xl object-cover mx-auto ring-2 ring-purple-500/40 shadow-xl"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white ring-2 ring-[#141824]">
                {isRomantic ? <HeartHandshake className="w-3.5 h-3.5" /> : <Flame className="w-3.5 h-3.5" />}
              </div>
            </div>

            <h2 className="text-lg font-bold text-white">{character.name}</h2>
            <p className="text-xs text-purple-300 font-medium mb-2">{character.subtitle}</p>

            <p className="text-xs text-slate-300/90 leading-relaxed max-w-md mx-auto mb-3">
              {character.backstory}
            </p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-purple-300">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>3-Panel Interactive Comic: User Move &bull; Reaction &bull; Climax</span>
            </div>
          </div>
        )}

        {/* Message Feed */}
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            character={character}
            onRegeneratePanel={onRegeneratePanel}
            onOpenImageViewer={onOpenImageViewer}
          />
        ))}

        {/* AI Typing / Waiting indicator */}
        {isLoadingResponse && (
          <div className="flex items-center gap-3 text-slate-400 text-xs py-2">
            <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141724] border border-white/5">
              <span className="text-purple-300 font-medium">{character?.name}</span>
              <span className="text-slate-400">is writing 3-panel comic beats</span>
              <span className="flex gap-1 ml-1">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom('smooth')}
          aria-label="Scroll to bottom"
          className="absolute right-6 bottom-36 p-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all z-20"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Input Tray & Controls */}
      <div className="p-3 sm:p-4 border-t border-white/10 bg-[#0d0f17]/95 backdrop-blur-md shrink-0 space-y-2">
        {/* Top Control Bar: "Continue Comic Story ➡️" Button + Quick Prompts */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Prominent Continue Comic Story Button */}
          <button
            onClick={onContinueStory}
            disabled={isLoadingResponse}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <FastForward className="w-4 h-4 text-pink-200" />
            <span>Continue Comic Story ➡️</span>
          </button>

          {/* Suggestion Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs flex-1 sm:justify-end">
            {suggestionPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(prompt);
                  textareaRef.current?.focus();
                }}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-purple-500/15 border border-white/5 hover:border-purple-500/30 text-slate-300 hover:text-purple-200 transition-colors text-[11px]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <div className="relative flex items-end gap-2 bg-[#141826] border border-white/10 rounded-2xl p-1.5 focus-within:border-purple-500/60 focus-within:ring-1 focus-within:ring-purple-500/60 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder={`Your action/dialogue with ${character?.name || 'character'}... (*actions* are visually depicted in Panel 1)`}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 px-3 py-2 focus:outline-none resize-none max-h-36 font-sans leading-relaxed"
          />

          <div className="flex items-center gap-1.5 pb-1 pr-1 shrink-0">
            {/* Quick Auto Comic toggle badge */}
            <button
              type="button"
              onClick={onToggleAutoComic}
              title={settings.autoGenerateComic ? "Auto 3-Panel Comic ON" : "Auto Comic Generation OFF"}
              className={`p-2 rounded-xl text-xs transition-colors flex items-center gap-1 ${
                settings.autoGenerateComic
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoadingResponse}
              aria-label="Send message"
              className={`p-2.5 rounded-xl font-medium transition-all ${
                inputText.trim() && !isLoadingResponse
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 hover:opacity-95'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footnote */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span className="truncate">
            Model: <span className="text-slate-400 font-mono">{settings.model.split('/')[1] || settings.model}</span> &bull; Horde: <span className="text-emerald-400 font-mono">100% Uncensored</span>
          </span>
          <span className="hidden sm:inline">Press Enter to send, Shift+Enter for newline</span>
        </div>
      </div>
    </div>
  );
}
