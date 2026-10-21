import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Sparkles, 
  X, 
  RotateCcw,
  Compass,
  Heart
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  characters,
  activeCharacterId,
  onSelectCharacter,
  onOpenCreateCharacter,
  onEditCharacter,
  onDeleteCharacter,
  onResetToDefaults,
  settings,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCharacters = characters.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.subtitle && c.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.personality && c.personality.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-80 bg-[#0e111a] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold tracking-wide text-white uppercase flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-400" />
              Characters
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-mono">
              {characters.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenCreateCharacter}
              title="Create Character"
              className="p-1.5 text-purple-300 hover:text-white bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-white/5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#151926] text-sm text-slate-200 placeholder-slate-500 pl-9 pr-3 py-2 rounded-xl border border-white/5 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Character List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredCharacters.length === 0 ? (
            <div className="text-center py-10 px-4">
              <p className="text-slate-500 text-sm">No characters found</p>
              <button
                onClick={onOpenCreateCharacter}
                className="mt-3 text-xs text-purple-400 hover:text-purple-300 underline"
              >
                Create one now
              </button>
            </div>
          ) : (
            filteredCharacters.map((char) => {
              const isActive = char.id === activeCharacterId;
              const isDrama = char.subtitle?.toLowerCase().includes('drama') || char.subtitle?.toLowerCase().includes('romance');

              return (
                <div
                  key={char.id}
                  onClick={() => {
                    onSelectCharacter(char.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`group relative p-3 rounded-2xl cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-950/40 to-indigo-950/30 border-purple-500/40 shadow-lg shadow-purple-950/30'
                      : 'bg-[#141724]/60 hover:bg-[#1a1f30] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={char.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                        alt={char.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10 group-hover:ring-purple-400/40 transition-all"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(char.name)}`;
                        }}
                      />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-[#141724] ${
                        isActive ? 'bg-purple-400' : 'bg-slate-600'
                      }`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                          {char.name}
                        </h3>
                        {isDrama ? (
                          <Heart className="w-3 h-3 text-pink-400 shrink-0" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-purple-300/80 font-medium truncate mt-0.5">
                        {char.subtitle || 'Custom Persona'}
                      </p>

                      <p className="text-[11px] text-slate-400/80 line-clamp-2 mt-1 leading-snug">
                        {char.personality}
                      </p>
                    </div>
                  </div>

                  {/* Actions on hover */}
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">
                      {char.isDefault ? 'Default' : 'Custom'}
                    </span>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCharacter(char);
                        }}
                        title="Edit Character"
                        className="p-1 text-slate-400 hover:text-purple-300 hover:bg-white/5 rounded-md"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {characters.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete "${char.name}"?`)) {
                              onDeleteCharacter(char.id);
                            }
                          }}
                          title="Delete Character"
                          className="p-1 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-[#0b0d14]/80 flex flex-col gap-2">
          <button
            onClick={onResetToDefaults}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Characters</span>
          </button>
          
          <div className="text-[11px] text-slate-500 px-2 py-1 bg-white/5 rounded-md flex items-center justify-between">
            <span className="truncate">Auto Comic:</span>
            <span className={settings.autoGenerateComic ? "text-emerald-400 font-semibold" : "text-slate-400"}>
              {settings.autoGenerateComic ? "Active" : "Off"}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
