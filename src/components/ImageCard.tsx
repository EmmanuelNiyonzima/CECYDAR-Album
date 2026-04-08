import React, { useState, useEffect } from 'react';
import { Download, Trash2, Maximize2, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Photo } from '@/types';
import { storage } from '@/lib/storage';

interface ImageCardProps {
  photo: Photo;
  isAdmin: boolean;
  isAuthenticated: boolean;
  onPreview: (url: string) => void;
  onDelete?: (id: string) => void;
  onAuthRequired: () => void;
}

export function ImageCard({ photo, isAdmin, isAuthenticated, onPreview, onDelete, onAuthRequired }: ImageCardProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    storage.getPhotoData(photo.id).then((data) => {
      if (isMounted && data) {
        setImageUrl(data);
        setIsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [photo.id]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (!imageUrl) return;
    
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
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
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group relative mb-4 break-inside-avoid overflow-hidden rounded-sm bg-secondary/20"
    >
      {isLoading ? (
        <div className="aspect-[3/4] flex items-center justify-center bg-secondary/10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={photo.name}
          className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      )}
      
      {/* Flickr-style Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 cursor-pointer"
        onClick={() => !isLoading && onPreview(imageUrl)}
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
              disabled={isLoading}
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
                if (!isLoading) onPreview(imageUrl);
              }}
              disabled={isLoading}
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
    </motion.div>
  );
}
