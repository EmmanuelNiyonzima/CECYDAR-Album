import React from 'react';
import { Download, Trash2, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Photo } from '@/types';

interface ImageCardProps {
  photo: Photo;
  isAdmin: boolean;
  onPreview: () => void;
  onDelete?: (id: string) => void;
}

export function ImageCard({ photo, isAdmin, onPreview, onDelete }: ImageCardProps) {
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative aspect-square overflow-hidden rounded-xl bg-secondary"
    >
      <img
        src={photo.url}
        alt={photo.name}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        referrerPolicy="no-referrer"
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex gap-2">
          <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full" onClick={onPreview}>
            <Eye className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full" onClick={handleDownload}>
            <Download className="h-5 w-5" />
          </Button>
          {isAdmin && onDelete && (
            <Button 
              size="icon" 
              variant="destructive" 
              className="h-10 w-10 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(photo.id);
              }}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
        <p className="max-w-[80%] truncate text-xs font-medium text-white">
          {photo.name}
        </p>
      </div>
    </motion.div>
  );
}
