import React, { useState, useEffect, useRef } from 'react';
import { X, User, Image, MessageSquare, Sparkles, Wand2, Tag, BookOpen, Check } from 'lucide-react';

const PRESET_AVATARS = [
  {
    name: 'Elena (Pianist Heiress)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Kaelen (Rogue Spellblade)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Seraphina (Cyberpunk Hacker)',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Lord Valerius (Vampire Noble)',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Aria (Forest Ranger)',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  }
];

export default function CharacterModal({
  isOpen,
  onClose,
  characterToEdit,
  onSaveCharacter,
}) {
  const dialogRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    avatar: '',
    personality: '',
    backstory: '',
    greeting: '',
    visualTags: '',
  });

  useEffect(() => {
    if (characterToEdit) {
      setFormData({
        name: characterToEdit.name || '',
        subtitle: characterToEdit.subtitle || '',
        avatar: characterToEdit.avatar || '',
        personality: characterToEdit.personality || '',
        backstory: characterToEdit.backstory || '',
        greeting: characterToEdit.greeting || '',
        visualTags: characterToEdit.visualTags || '',
      });
    } else {
      // Default template for a new character
      setFormData({
        name: '',
        subtitle: '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        personality: '',
        backstory: '',
        greeting: '',
        visualTags: '1girl, long dark wavy hair, expressive eyes, warm lighting, webtoon comic style',
      });
    }
  }, [characterToEdit, isOpen]);

  // Native dialog showModal & light-dismiss
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
    if (!formData.name.trim()) return;

    const characterData = {
      ...formData,
      id: characterToEdit ? characterToEdit.id : `char_${Date.now()}`,
      isDefault: characterToEdit?.isDefault || false,
    };

    onSaveCharacter(characterData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="character-dialog-title"
      onClick={handleDialogClick}
      className="p-0 bg-transparent backdrop:bg-black/75 backdrop:backdrop-blur-sm fixed inset-0 m-auto z-50 max-w-xl w-[94vw] rounded-2xl outline-none"
    >
      <div className="bg-[#121622] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#161a29]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 id="character-dialog-title" className="text-base font-bold text-white">
                {characterToEdit ? `Edit "${characterToEdit.name}"` : 'Create New Character'}
              </h2>
              <p className="text-xs text-slate-400">Design persona, greeting, and visual comic tags</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Name & Subtitle row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-400" />
                Character Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Valerie Frost"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#0b0e17] text-sm text-slate-100 placeholder-slate-600 px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500/60 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Role / Genre Tag
              </label>
              <input
                type="text"
                placeholder="e.g. Romantic Drama • Secret Spy"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full bg-[#0b0e17] text-sm text-slate-100 placeholder-slate-600 px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500/60 transition-colors"
              />
            </div>
          </div>

          {/* Avatar URL & Live Preview */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-cyan-400" />
              Avatar Image URL
            </label>
            <div className="flex gap-3 items-center">
              <img
                src={formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt="Avatar preview"
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-500/40 shrink-0 bg-slate-800"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formData.name || 'avatar')}`;
                }}
              />
              <div className="flex-1">
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="w-full bg-[#0b0e17] text-sm text-slate-100 placeholder-slate-600 px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500/60 transition-colors"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 mr-1 self-center">Presets:</span>
                  {PRESET_AVATARS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: preset.url })}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                    >
                      {preset.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Personality */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
              Personality &amp; Mannerisms
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Sarcastic, fiercely loyal, speaks in quiet whispers, smiles when nervous..."
              value={formData.personality}
              onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
              className="w-full bg-[#0b0e17] text-sm text-slate-100 placeholder-slate-600 px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500/60 transition-colors"
            />
          </div>

          {/* Backstory */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Backstory &amp; Relationship to User
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Your former lab partner whom you haven't seen since the incident..."
              value={formData.backstory}
              onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
              className="w-full bg-[#0b0e17] text-sm text-slate-100 placeholder-slate-600 px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500/60 transition-colors"
            />
          </div>

          {/* First Greeting Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              First Greeting Message
            </label>
            <textarea
              rows={3}
              placeholder='*Steps out from the shadows with a faint smirk.* "Took you long enough to find me."'
              value={formData.greeting}
              onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
              className="w-full bg-[#0b0e17] text-sm text-slate-100 placeholder-slate-600 px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-emerald-500/60 transition-colors font-sans"
            />
            <p className="text-[11px] text-slate-400">
              Tip: Put actions inside <code className="text-purple-300">*asterisks*</code> and spoken dialogue in quotes.
            </p>
          </div>

          {/* Visual Appearance Tags */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-pink-400" />
                Character Visual Appearance Tags (For Comic Panel Consistency)
              </label>
            </div>
            <textarea
              rows={2}
              placeholder="1girl, long dark wavy hair, expressive eyes, warm lighting, webtoon comic style"
              value={formData.visualTags}
              onChange={(e) => setFormData({ ...formData, visualTags: e.target.value })}
              className="w-full bg-[#0b0e17] text-sm text-slate-100 placeholder-slate-600 px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-pink-500/60 transition-colors font-mono"
            />
            <p className="text-[11px] text-slate-400">
              Tags are merged with the dynamic scene description sent to AI Horde so every generated comic panel preserves the character's signature look.
            </p>
          </div>

          {/* Footer buttons */}
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
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 rounded-xl transition-all shadow-md shadow-purple-600/30 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{characterToEdit ? 'Save Changes' : 'Create Character'}</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
