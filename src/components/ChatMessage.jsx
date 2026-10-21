import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Sparkles, 
  Image as ImageIcon, 
  Maximize2, 
  Download, 
  AlertCircle, 
  Copy, 
  Check, 
  Eye,
  Camera,
  Layers,
  Edit3
} from 'lucide-react';

/**
 * Parses markdown-style asterisks for physical actions
 * - Text inside *asterisks* -> Italicized muted accent text (serif or subtle tone)
 * - Normal text / dialogue -> Crisp bright text
 */
export const FormattedRoleplayText = ({ text }) => {
  if (!text) return null;

  // Clean any remaining [SCENE: ...] tags or unclosed fragments from visible text
  const cleanText = text
    .replace(/\[SCENE:\s*[\s\S]*?\]/gi, '')
    .replace(/\[SCENE:[\s\S]*$/gi, '')
    .trim();

  // Split by asterisks: match both asterisks and whatever is in between
  const parts = cleanText.split(/(\*[^*]+\*)/g);

  return (
    <div className="space-y-1.5 break-words">
      {parts.map((part, index) => {
        if (!part) return null;

        // Text enclosed in asterisks
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
          const actionContent = part.slice(1, -1);
          return (
            <span
              key={index}
              className="block font-serif italic text-purple-300/85 text-[14.5px] leading-relaxed my-1 tracking-wide"
            >
              *{actionContent}*
            </span>
          );
        }

        // Spoken dialogue or narrative prose
        return (
          <span
            key={index}
            className="font-sans text-slate-100 font-normal text-[15px] leading-relaxed"
          >
            {part}
          </span>
        );
      })}
    </div>
  );
};

/**
 * Single Comic Panel component with loading animation, image view, editable prompt & regeneration
 */
const ComicPanel = ({
  panel,
  messageId,
  character,
  onRegeneratePanel,
  onOpenImageViewer,
}) => {
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(panel.scenePrompt || '');

  useEffect(() => {
    setEditedPrompt(panel.scenePrompt || '');
  }, [panel.scenePrompt]);

  const handleSaveAndRegenerate = () => {
    onRegeneratePanel(messageId, panel.id || panel.panelIndex, editedPrompt.trim());
    setIsEditingPrompt(false);
  };

  return (
    <div className="my-3 w-full">
      {/* State 1: Rendering image */}
      {panel.isGeneratingImage && (
        <div className="relative overflow-hidden rounded-2xl bg-[#0e111a] border border-purple-500/30 p-4 shadow-inner min-h-[160px] flex flex-col justify-center">
          {/* Animated neon scanline */}
          <div className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-purple-500/20 to-transparent animate-scanline pointer-events-none" />

          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-xl bg-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-300 animate-pulse">
                <Sparkles className="w-5 h-5 text-purple-400 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-purple-200 flex items-center gap-1.5">
                  <span>Rendering Webtoon Panel #{panel.panelIndex}</span>
                </p>
                <span className="text-[10px] text-purple-300/80 font-mono animate-pulse">
                  AI Horde
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mt-1 truncate">
                {panel.hordeProgress?.isProcessing
                  ? '🎨 Worker GPU currently painting panel...'
                  : panel.hordeProgress?.queuePosition > 0
                  ? `Queue position #${panel.hordeProgress.queuePosition} • Est. wait ~${Math.max(1, panel.hordeProgress.waitTime || 5)}s`
                  : 'Submitting 2-person prompt to AI Horde...'}
              </p>
            </div>
          </div>

          <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 h-full rounded-full animate-pulse" style={{ width: '85%' }} />
          </div>
        </div>
      )}

      {/* State 2: Comic Image Loaded */}
      {panel.imageUrl && !panel.isGeneratingImage && (
        <div className="space-y-2">
          <div className="relative group/panel overflow-hidden rounded-2xl border-2 border-purple-500/30 bg-[#08090f] shadow-2xl max-w-md mx-auto">
            <img
              src={panel.imageUrl}
              alt={`Webtoon Panel ${panel.panelIndex}`}
              className="w-full h-auto max-h-[640px] object-contain cursor-pointer transition-transform duration-300 group-hover/panel:scale-[1.01] block mx-auto"
              onClick={() => onOpenImageViewer && onOpenImageViewer(panel.imageUrl, panel.scenePrompt)}
            />

            {/* Badge overlay */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-purple-200">
              <Camera className="w-3 h-3 text-purple-400" />
              <span>Panel {panel.panelIndex}</span>
            </div>

            {/* Hover actions */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover/panel:opacity-100 transition-opacity">
              <button
                onClick={() => onOpenImageViewer && onOpenImageViewer(panel.imageUrl, panel.scenePrompt)}
                className="p-1.5 rounded-lg bg-black/75 backdrop-blur-md text-white hover:bg-black/90 transition-colors"
                title="Fullscreen Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <a
                href={panel.imageUrl}
                download={`webtoon_panel_${panel.panelIndex}_${Date.now()}.webp`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-black/75 backdrop-blur-md text-white hover:bg-black/90 transition-colors"
                title="Download Panel"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Panel Footer Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <button
              onClick={() => setIsEditingPrompt(!isEditingPrompt)}
              className="text-[11px] text-slate-400 hover:text-purple-300 flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/5 border border-transparent hover:border-purple-500/30 transition-colors"
            >
              <Edit3 className="w-3 h-3 text-purple-400" />
              <span>{isEditingPrompt ? 'Close Editor' : 'Scene Prompt'}</span>
            </button>

            <button
              onClick={() => onRegeneratePanel(messageId, panel.id || panel.panelIndex)}
              className="text-[11px] font-medium text-purple-300 hover:text-purple-100 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 transition-all shadow-sm"
            >
              <RefreshCw className="w-3 h-3 text-purple-400" />
              <span>Regenerate Panel</span>
            </button>
          </div>
        </div>
      )}

      {/* State 3: Failed Generation */}
      {panel.imageError && !panel.isGeneratingImage && (
        <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-red-300 min-w-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="truncate">{panel.imageError}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsEditingPrompt(!isEditingPrompt)}
              className="text-xs px-2.5 py-1 text-slate-400 hover:text-purple-300 border border-white/10 hover:border-purple-500/30 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Edit3 className="w-3 h-3 text-purple-400" />
              <span>Scene Prompt</span>
            </button>
            <button
              onClick={() => onRegeneratePanel(messageId, panel.id || panel.panelIndex)}
              className="text-xs px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 rounded-lg flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      )}

      {/* State 4: Not yet generated */}
      {!panel.imageUrl && !panel.isGeneratingImage && !panel.imageError && panel.scenePrompt && (
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={() => setIsEditingPrompt(!isEditingPrompt)}
            className="text-[11px] font-medium text-slate-400 hover:text-purple-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 transition-all"
          >
            <Edit3 className="w-3 h-3 text-purple-400" />
            <span>Scene Prompt</span>
          </button>
          <button
            onClick={() => onRegeneratePanel(messageId, panel.id || panel.panelIndex)}
            className="text-[11px] font-medium text-slate-400 hover:text-purple-300 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 transition-all"
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Render Panel #{panel.panelIndex}</span>
          </button>
        </div>
      )}

      {/* Editable Scene Prompt Drawer with Save & Regenerate Panel */}
      {isEditingPrompt && (
        <div className="p-3 rounded-xl bg-[#0c0f18] border border-purple-500/40 text-xs space-y-2 mt-2 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-purple-300 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-purple-400" />
              Edit Scene Prompt (Stable Diffusion Tags)
            </span>
            {panel.imageModel && (
              <span className="text-[10px] text-slate-500 font-mono">
                Model: {panel.imageModel}
              </span>
            )}
          </div>

          <textarea
            rows={3}
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            placeholder="Enter custom visual scene prompt tags..."
            className="w-full bg-[#07090f] text-xs text-purple-100 placeholder-slate-600 p-2.5 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-400 font-mono leading-relaxed"
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setEditedPrompt(panel.scenePrompt || '');
                setIsEditingPrompt(false);
              }}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-md hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndRegenerate}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all hover:scale-[1.01]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Save &amp; Regenerate Panel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ChatMessage({
  message,
  character,
  onRegeneratePanel,
  onOpenImageViewer,
}) {
  const isAI = message.sender === 'ai';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = message.text
      .replace(/\[SCENE:\s*[\s\S]*?\]/gi, '')
      .replace(/\[SCENE:[\s\S]*$/gi, '')
      .trim();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If user message: render clean message bubble
  if (!isAI) {
    return (
      <div className="flex w-full justify-end group">
        <div className="max-w-[88%] sm:max-w-[78%] md:max-w-[70%] flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-xs font-semibold text-slate-300">You</span>
            <span className="text-[10px] text-slate-500 font-mono">{message.timestamp || ''}</span>
          </div>

          <div className="relative px-4 py-3 rounded-2xl glass-bubble-user text-white rounded-tr-sm">
            <FormattedRoleplayText text={message.text} />
          </div>

          <div className="mt-1 flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
            <button
              onClick={handleCopy}
              className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 py-0.5"
              title="Copy message"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normalize panels array (if old single-message structure exists, wrap into a panel)
  const panels = Array.isArray(message.panels) && message.panels.length > 0
    ? message.panels
    : [
        {
          id: `${message.id}_panel_1`,
          panelIndex: 1,
          beatTitle: "Webtoon Comic Panel",
          text: message.text,
          scenePrompt: message.sceneDescription,
          imageUrl: message.imageUrl,
          isGeneratingImage: message.isGeneratingImage,
          imageError: message.imageError,
          hordeProgress: message.hordeProgress,
          imageModel: message.imageModel,
        }
      ];

  return (
    <div className="flex w-full gap-3 justify-start group">
      {/* AI Avatar */}
      <div className="shrink-0 mt-1">
        <img
          src={character?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
          alt={character?.name || 'Character'}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover ring-1 ring-purple-500/30 shadow-md"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(character?.name || 'ai')}`;
          }}
        />
      </div>

      {/* Message Chapter Container */}
      <div className="max-w-[94%] sm:max-w-[85%] md:max-w-[78%] flex flex-col items-start w-full">
        {/* Header Label */}
        <div className="flex items-center gap-2 mb-1.5 px-1">
          <span className="text-xs font-semibold text-slate-200">
            {character?.name}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium flex items-center gap-1">
            <Layers className="w-3 h-3" />
            <span>Webtoon Chapter • {panels.length} Panels</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {message.timestamp || ''}
          </span>
        </div>

        {/* Main Plotta Webtoon Chapter Bubble */}
        <div className="relative px-4 sm:px-5 py-4 rounded-2xl glass-bubble-ai text-slate-100 rounded-tl-sm w-full space-y-4">
          {/* Interleaved Webtoon Panels: Beat Text -> Panel Image */}
          {panels.map((panel, idx) => (
            <div key={panel.id || idx} className="space-y-2 border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
              {/* Beat header pill */}
              <div className="flex items-center justify-between text-[11px] text-purple-300/90 font-medium">
                <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider text-[10px] text-purple-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  {panel.beatTitle || `Panel ${panel.panelIndex || idx + 1}`}
                </span>
              </div>

              {/* Beat Text (with asterisks formatted) */}
              <div className="text-[14.5px] sm:text-[15px]">
                <FormattedRoleplayText text={panel.text} />
              </div>

              {/* Streaming token cursor */}
              {message.isStreaming && idx === panels.length - 1 && (
                <span className="inline-block w-2 h-4 ml-1 bg-purple-400 animate-pulse align-middle" />
              )}

              {/* Inline Webtoon Comic Panel */}
              <ComicPanel
                panel={panel}
                messageId={message.id}
                character={character}
                onRegeneratePanel={onRegeneratePanel}
                onOpenImageViewer={onOpenImageViewer}
              />
            </div>
          ))}
        </div>

        {/* Copy whole chapter action */}
        <div className="mt-1 flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
          <button
            onClick={handleCopy}
            className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 py-0.5"
            title="Copy whole chapter"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Chapter Copied' : 'Copy Chapter'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
