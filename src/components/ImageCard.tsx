import React, { useState, useEffect, useRef } from 'react';
import { Download, Trash2, Maximize2, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Photo } from '@/types';

interface ImageCardProps {
  photo: Photo;
  isAdmin: boolean;
  isAuthenticated: boolean;
  onPreview: (url: string) => void;
  onDelete?: (id: string) => void;
  onAuthRequired: () => void;
}

export function ImageCard({ photo, isAdmin, isAuthenticated, onPreview, onDelete, onAuthRequired }: ImageCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, []);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group relative mb-4 break-inside-avoid overflow-hidden rounded-sm bg-secondary/10"
    >
      {/* Loading State Overlay */}
      {!isLoaded && !hasError && (
        <div className="aspect-[3/4] flex flex-col items-center justify-center bg-secondary/5 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40" />
          <span className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-bold">Loading</span>
        </div>
      )}

      {/* Error State Overlay */}
      {hasError && (
        <div className="aspect-[3/4] flex flex-col items-center justify-center bg-destructive/5 gap-2 p-4 text-center">
          <AlertCircle className="h-6 w-6 text-destructive/50" />
          <span className="text-[10px] text-destructive/50 uppercase tracking-widest font-bold">Failed to load</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[10px] h-7"
            onClick={() => { setHasError(false); setIsLoaded(false); }}
          >
            Retry
          </Button>
        </div>
      )}

      <img
        ref={imgRef}
        src={photo.url}
        alt={photo.name}
        className={`w-full object-cover transition-all duration-700 group-hover:scale-105 ${isLoaded ? 'opacity-100 block' : 'opacity-0 h-0 w-0'}`}
        referrerPolicy="no-referrer"
        onLoad={() => {
          setIsLoaded(true);
        }}
        onError={() => {
          setHasError(true);
        }}
      />
      
      {/* Flickr-style Overlay */}
      {isLoaded && (
        <div 
          className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 cursor-pointer"
          onClick={() => onPreview(photo.url)}
        >
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between text-white bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate pr-2">{photo.name}</span>
              <span className="text-[10px] opacity-70">{(photo.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                onClick={handleDownload}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(photo.url);
                }}
                title="View Large"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>

              {isAdmin && onDelete && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 rounded-full shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(photo.id);
                  }}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
