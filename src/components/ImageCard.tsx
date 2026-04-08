import React from 'react';
import { Download, Trash2, Maximize2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Photo } from '@/types';

interface ImageCardProps {
  photo: Photo;
  isAdmin: boolean;
  isAuthenticated: boolean;
  onPreview: () => void;
  onDelete?: (id: string) => void;
  onAuthRequired: () => void;
}

export function ImageCard({ photo, isAdmin, isAuthenticated, onPreview, onDelete, onAuthRequired }: ImageCardProps) {
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
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
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group relative mb-4 break-inside-avoid overflow-hidden rounded-sm bg-secondary/20"
    >
      <img
        src={photo.url}
        alt={photo.name}
        className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
        referrerPolicy="no-referrer"
        loading="lazy"
      />
      
      {/* Flickr-style Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 cursor-pointer"
        onClick={onPreview}
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
                onPreview();
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
    </motion.div>
  );
}
