import React, { useState, useEffect, useRef } from 'react';
import { X, Key, Cpu, Image, Sparkles, Check, ExternalLink, Eye, EyeOff, ShieldCheck, User, Flame, BookOpen } from 'lucide-react';
import { MODEL_OPTIONS, DEFAULT_HORDE_MODELS, STORY_LENGTH_OPTIONS } from '../services/storage';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) {
  const dialogRef = useRef(null);
  const [formData, setFormData] = useState(settings);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [showHordeKey, setShowHordeKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [hordeModels, setHordeModels] = useState(DEFAULT_HORDE_MODELS);
  const [isLoadingHordeModels, setIsLoadingHordeModels] = useState(false);
  const [isCustomHordeModel, setIsCustomHordeModel] = useState(false);

  useEffect(() => {
    setFormData(settings);
    if (settings.hordeModel && !DEFAULT_HORDE_MODELS.some(m => m.id === settings.hordeModel)) {
      setIsCustomHordeModel(true);
    } else {
      setIsCustomHordeModel(false);
    }
  }, [settings, isOpen]);

  // Fetch active AI Horde models when modal opens
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    const fetchActiveModels = async () => {
      setIsLoadingHordeModels(true);
      try {
        const res = await fetch('https://aihorde.net/api/v2/status/models?type=image');
        if (res.ok && !isCancelled) {
          const data = await res.json();
          if (Array.isArray(data)) {
            // Sort by active workers count descending
            const active = data
              .filter((m) => m && m.count > 0 && m.name)
              .sort((a, b) => b.count - a.count);

            const mappedActive = active.slice(0, 35).map((m) => ({
              id: m.name,
              name: `${m.name} (${m.count} worker${m.count > 1 ? 's' : ''}${m.queued > 0 ? `, ${m.queued} queued` : ''})`,
              badge: `${m.count}W`,
            }));

            // Recommended high-accuracy uncensored models pinned at the top
            const RECOMMENDED_TOP = [
              { id: 'AlbedoBase XL (SDXL)', name: 'AlbedoBase XL (SDXL - High Fidelity & Accuracy)', badge: 'Top SDXL' },
              { id: 'WAI-NSFW-illustrious-SDXL', name: 'WAI-NSFW-illustrious-SDXL (Uncensored Webtoon / Anime)', badge: 'Top NSFW' },
              { id: 'MeinaMix', name: 'MeinaMix (Anime / Manhwa Webtoon)', badge: 'Webtoon' },
              { id: 'Dreamshaper', name: 'Dreamshaper (Cinematic Semi-Realistic)', badge: 'Cinematic' },
            ];

            // If a recommended model is currently online, enrich its label with live worker count
            const enrichedRecommended = RECOMMENDED_TOP.map((rec) => {
              const live = active.find((m) => m.name.toLowerCase() === rec.id.toLowerCase());
              if (live) {
                return {
                  ...rec,
                  name: `${rec.id} (${live.count} worker${live.count > 1 ? 's' : ''} online)`,
                };
              }
              return rec;
            });

            // Remaining active models without duplicates
            const restActive = mappedActive.filter(
              (m) => !RECOMMENDED_TOP.some((rec) => rec.id.toLowerCase() === m.id.toLowerCase())
            );

            // Combine: Fast Worker + Recommended Top + Other Active Workers + Custom
            const combined = [
              { id: '', name: 'Any Available Fast Worker (Fastest)', badge: 'Fastest' },
              ...enrichedRecommended,
              ...restActive,
              { id: 'custom', name: 'Custom Checkpoint Model...', badge: 'Custom' },
            ];

            // If current model is not in list and not empty/custom, preserve it
            if (formData.hordeModel && !combined.some((m) => m.id === formData.hordeModel)) {
              combined.splice(1, 0, {
                id: formData.hordeModel,
                name: `${formData.hordeModel} (Saved)`,
                badge: 'Saved',
              });
            }

            setHordeModels(combined);
          }
        }
      } catch (err) {
        console.warn('Could not fetch active AI Horde models; using defaults', err);
      } finally {
        if (!isCancelled) setIsLoadingHordeModels(false);
      }
    };

    fetchActiveModels();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  // Handle native <dialog> showModal and light-dismiss
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Fallback light-dismiss for browsers without closedby support
  const handleDialogClick = (e) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (e.target !== dialog) return;

    const rect = dialog.getBoundingClientRect();
    const isInside =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;

    if (!isInside) {
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  const isCustomModel = formData.model === 'custom';
  const selectedModelMeta = MODEL_OPTIONS.find((m) => m.id === formData.model);

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="settings-dialog-title"
      onClick={handleDialogClick}
      className="p-0 bg-transparent backdrop:bg-black/75 backdrop:backdrop-blur-sm fixed inset-0 m-auto z-50 max-w-lg w-[92vw] rounded-2xl outline-none"
    >
      <div className="bg-[#121622] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#161a29]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 id="settings-dialog-title" className="text-base font-bold text-white">
                Studio Settings
              </h2>
              <p className="text-xs text-slate-400">Configure your persona, AI models &amp; comic options</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings modal"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* User Persona Appearance Tags */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-purple-950/25 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-purple-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-400" />
                My Visual Appearance (User Persona Tags)
              </label>
              <span className="text-[10px] text-purple-300 font-mono">2-Person Panels</span>
            </div>
            <textarea
              rows={2}
              placeholder="1boy, handsome young man, dark hair, sharp jawline, stylish casual clothes"
              value={formData.userPersonaTags ?? '1boy, handsome young man, dark hair, sharp jawline, stylish casual clothes'}
              onChange={(e) => setFormData({ ...formData, userPersonaTags: e.target.value })}
              className="w-full bg-[#0b0e17] text-sm text-slate-100 placeholder-slate-600 px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition-colors font-mono"
            />
            <p className="text-[11px] text-purple-300/80 leading-relaxed">
              Injected into two-person webtoon panels so you appear consistently interacting with the character.
            </p>
          </div>

          {/* OpenRouter API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                OpenRouter API Key
              </label>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 underline"
              >
                Get API Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showOpenRouterKey ? 'text' : 'password'}
                placeholder="sk-or-v1-..."
                value={formData.openRouterApiKey}
                onChange={(e) => setFormData({ ...formData, openRouterApiKey: e.target.value })}
                className="w-full bg-[#0b0e17] text-sm text-slate-100 placeholder-slate-600 px-3 py-2.5 pr-10 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showOpenRouterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Stored securely in your local browser only. Never sent to any third-party server.
            </p>
          </div>

          {/* Model Selector Dropdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Roleplay AI Model
              </label>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                {isCustomModel ? 'Custom Model' : selectedModelMeta?.badge || 'Free'}
              </span>
            </div>
            <select
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full bg-[#0b0e17] text-sm text-slate-100 px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition-colors cursor-pointer"
            >
              {MODEL_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>

            {/* Model Description Helper */}
            {selectedModelMeta?.description && !isCustomModel && (
              <p className="text-[11px] text-slate-400 pt-0.5">
                {selectedModelMeta.description}
              </p>
            )}

            {/* Custom Model ID input if selected */}
            {isCustomModel && (
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="e.g. mistralai/mistral-large or meta-llama/llama-3.3-70b-instruct"
                  value={formData.customModelId}
                  onChange={(e) => setFormData({ ...formData, customModelId: e.target.value })}
                  className="w-full bg-[#0b0e17] text-sm text-slate-100 placeholder-slate-600 px-3 py-2 rounded-xl border border-purple-500/40 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors font-mono"
                />
                <p className="text-[11px] text-purple-400 mt-1">
                  Enter any valid model slug from the OpenRouter catalog.
                </p>
              </div>
            )}
          </div>

          {/* Story Length / Detail Level Selector */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                Response Length / Story Detail
              </label>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                {STORY_LENGTH_OPTIONS.find((o) => o.id === (formData.storyLength || 'novel'))?.badge || 'Novel'}
              </span>
            </div>

            <select
              value={formData.storyLength || 'novel'}
              onChange={(e) => setFormData({ ...formData, storyLength: e.target.value })}
              className="w-full bg-[#0b0e17] text-sm text-slate-100 px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 transition-colors cursor-pointer"
            >
              {STORY_LENGTH_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>

            <p className="text-[11px] text-slate-400 pt-0.5">
              {STORY_LENGTH_OPTIONS.find((o) => o.id === (formData.storyLength || 'novel'))?.description}
            </p>
          </div>

          {/* AI Horde API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5 text-cyan-400" />
                AI Horde API Key (Optional)
              </label>
              <a
                href="https://aihorde.net/register"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline"
              >
                Register for Kudos <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showHordeKey ? 'text' : 'password'}
                placeholder="0000000000 (Anonymous Public Tier)"
                value={formData.aiHordeApiKey}
                onChange={(e) => setFormData({ ...formData, aiHordeApiKey: e.target.value })}
                className="w-full bg-[#0b0e17] text-sm text-slate-100 placeholder-slate-600 px-3 py-2.5 pr-10 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowHordeKey(!showHordeKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showHordeKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Defaults to <code className="text-cyan-300 bg-white/5 px-1 py-0.5 rounded font-mono">0000000000</code> if left blank. Free public crowdsourced GPU generation!
            </p>
          </div>

          {/* AI Horde Checkpoint Model Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5 text-pink-400" />
                AI Horde Image Model (Checkpoint)
              </label>
              {isLoadingHordeModels && (
                <span className="text-[10px] text-pink-300 font-mono animate-pulse">
                  Fetching active workers...
                </span>
              )}
            </div>
            <select
              value={isCustomHordeModel ? 'custom' : (formData.hordeModel || '')}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'custom') {
                  setIsCustomHordeModel(true);
                } else {
                  setIsCustomHordeModel(false);
                  setFormData({ ...formData, hordeModel: val });
                }
              }}
              className="w-full bg-[#0b0e17] text-sm text-slate-100 px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/60 transition-colors cursor-pointer"
            >
              {hordeModels.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>

            {isCustomHordeModel && (
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="e.g. MeinaMix, Dreamshaper, Counterfeit-V3.0"
                  value={formData.hordeModel === 'custom' ? '' : (formData.hordeModel || '')}
                  onChange={(e) => setFormData({ ...formData, hordeModel: e.target.value })}
                  className="w-full bg-[#0b0e17] text-sm text-slate-100 placeholder-slate-600 px-3 py-2 rounded-xl border border-pink-500/40 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors font-mono"
                />
                <p className="text-[11px] text-pink-300 mt-1">
                  Enter the exact model checkpoint name hosted on AI Horde.
                </p>
              </div>
            )}

            <p className="text-[11px] text-slate-400">
              Select a webtoon/manhwa/anime checkpoint (e.g. MeinaMix, Anything Diffusion) or keep Any Available Fast Worker.
            </p>
          </div>

          {/* Allow Uncensored / NSFW Content Toggle */}
          <div className="pt-2 pb-1 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-pink-400" />
                Allow Uncensored / NSFW Content
              </span>
              <span className="text-xs text-slate-400">
                100% uncensored generation via AI Horde workers without filters
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={formData.allowNsfw !== false}
              onClick={() => setFormData({ ...formData, allowNsfw: formData.allowNsfw === false ? true : false })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-[#121622] ${
                formData.allowNsfw !== false ? 'bg-pink-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formData.allowNsfw !== false ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Auto-Generate Comic Panels Toggle */}
          <div className="pt-2 pb-1 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-white block">
                Auto-Generate Comic Panels
              </span>
              <span className="text-xs text-slate-400">
                Automatically render 3 webtoon panels in parallel for every response
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={formData.autoGenerateComic}
              onClick={() => setFormData({ ...formData, autoGenerateComic: !formData.autoGenerateComic })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#121622] ${
                formData.autoGenerateComic ? 'bg-purple-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formData.autoGenerateComic ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl transition-all shadow-md shadow-purple-600/30 flex items-center gap-2"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
