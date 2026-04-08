import React from 'react';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Photo } from '@/types';

interface ImagePreviewModalProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export function ImagePreviewModal({ photo, isOpen, onClose, onNext, onPrev }: ImagePreviewModalProps) {
  if (!photo) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = photo.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] border-none bg-transparent p-0 shadow-none sm:max-w-[85vw]">
        <div className="relative flex h-[85vh] w-full flex-col items-center justify-center">
          <div className="absolute right-0 top-0 z-50 flex gap-2 p-4">
            <Button size="icon" variant="secondary" className="rounded-full bg-black/50 text-white hover:bg-black/70" onClick={handleDownload}>
              <Download className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="secondary" className="rounded-full bg-black/50 text-white hover:bg-black/70" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="relative flex h-full w-full items-center justify-center px-12">
            {onPrev && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute left-0 z-50 h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/40"
                onClick={onPrev}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}
            
            <img
              src={photo.url}
              alt={photo.name}
              className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
              referrerPolicy="no-referrer"
            />

            {onNext && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute right-0 z-50 h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/40"
                onClick={onNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}
          </div>

          <div className="mt-4 flex flex-col items-center text-white">
            <p className="text-lg font-semibold">{photo.name}</p>
            <p className="text-sm opacity-70">Original Quality • {(photo.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
