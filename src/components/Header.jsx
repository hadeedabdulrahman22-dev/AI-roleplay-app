import React from 'react';
import { Sparkles, Settings, Menu, Plus, RefreshCw } from 'lucide-react';

export default function Header({
  activeCharacter,
  onOpenSettings,
  onOpenCreateCharacter,
  onToggleSidebar,
  onResetChat,
  isSidebarOpen,
  settings,
}) {
  return (
    <header className="h-16 px-4 border-b border-white/10 bg-[#0d0f17]/90 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle character sidebar"
          className="p-2 -ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0d0f17]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Plotta <span className="text-purple-400 font-medium">Studio</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30 rounded-md">
                Comic AI
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[180px] sm:max-w-xs">
              {activeCharacter ? activeCharacter.name : 'Select a character'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCreateCharacter}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg transition-all shadow-sm hover:shadow-purple-500/20"
        >
          <Plus className="w-4 h-4 text-purple-400" />
          <span>New Character</span>
        </button>

        <button
          onClick={onResetChat}
          title="Restart Conversation"
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          title="Open Settings"
          className="relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          <Settings className="w-5 h-5" />
          {!settings.openRouterApiKey && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
          )}
          {!settings.openRouterApiKey && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full" />
          )}
        </button>
      </div>
    </header>
  );
}
