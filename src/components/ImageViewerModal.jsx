import React, { useEffect, useRef } from 'react';
import { X, Download, ExternalLink, Sparkles } from 'lucide-react';

export default function ImageViewerModal({
  isOpen,
  onClose,
  imageUrl,
  sceneDescription,
}) {
  const dialogRef = useRef(null);

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

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-label="Comic panel fullscreen view"
      onClick={handleBackdropClick}
      className="p-0 bg-transparent backdrop:bg-black/85 backdrop:backdrop-blur-md fixed inset-0 m-auto z-50 max-w-4xl w-[94vw] outline-none"
    >
      <div className="relative flex flex-col bg-[#0d101a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[92vh]">
        {/* Top bar */}
        <div className="px-4 py-3 bg-[#131726] border-b border-white/10 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-white">Webtoon Comic Panel View</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              download="comic_scene.webp"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs px-2.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
            <button
              onClick={onClose}
              aria-label="Close image viewer"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-[#08090f]">
          <img
            src={imageUrl}
            alt="Comic scene fullscreen"
            className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl border border-white/10"
          />
        </div>

        {/* Bottom scene prompt info */}
        {sceneDescription && (
          <div className="p-3 bg-[#131726] border-t border-white/10 text-xs text-slate-300 flex items-center justify-between gap-4">
            <p className="truncate">
              <strong className="text-purple-300">Extracted Scene:</strong> {sceneDescription}
            </p>
          </div>
        )}
      </div>
    </dialog>
  );
}
