import React, { useEffect, useState } from 'react';
import { X, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Photo } from '@/types';
import { storage } from '@/lib/storage';

interface ImagePreviewModalProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export function ImagePreviewModal({ photo, isOpen, onClose, onNext, onPrev }: ImagePreviewModalProps) {
  const isLoading = !photo?.url;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext?.();
      if (e.key === 'ArrowLeft') onPrev?.();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onNext, onPrev]);

  if (!photo) return null;

  const handleDownload = async () => {
    if (!photo.url) return;
    try {
      const link = document.createElement('a');
      link.href = photo.url;
      link.download = photo.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
        >
          {/* Top Bar */}
          <div className="flex h-16 items-center justify-between px-6 text-white bg-black/20">
            <div className="flex flex-col">
              <span className="text-sm font-bold">{photo.name}</span>
              <span className="text-[10px] opacity-60">CECYDAR Collections</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleDownload} className="text-white hover:bg-white/10">
                <Download className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="relative flex-1 flex items-center justify-center p-4 md:p-12 overflow-hidden">
            {/* Navigation Buttons */}
            <div className="absolute inset-y-0 left-0 flex items-center px-4 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrev}
                className="h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/40 border border-white/10"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            </div>
            
            <div className="absolute inset-y-0 right-0 flex items-center px-4 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={onNext}
                className="h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/40 border border-white/10"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </div>

            {/* Image */}
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-white/20" />
                <span className="text-white/40 text-xs tracking-widest uppercase">Loading High Res...</span>
              </div>
            ) : (
              <motion.img
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                src={photo.url}
                alt={photo.name}
                className="max-h-full max-w-full object-contain shadow-2xl"
                referrerPolicy="no-referrer"
              />
            )}
          </div>

          {/* Bottom Info */}
          <div className="h-16 flex items-center justify-center px-6 text-white/40 text-[10px] uppercase tracking-widest">
            Use arrow keys to navigate • Esc to close
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
