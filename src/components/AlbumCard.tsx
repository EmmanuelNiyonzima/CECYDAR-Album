import React from 'react';
import { Calendar, Image as ImageIcon, Trash2, FolderOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Album } from '@/types';
import { format } from 'date-fns';

interface AlbumCardProps {
  album: Album;
  isAdmin: boolean;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

export function AlbumCard({ album, isAdmin, onClick, onDelete }: AlbumCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="group relative aspect-[4/3] cursor-pointer overflow-hidden border-none bg-secondary/30 shadow-sm transition-all hover:shadow-xl"
        onClick={onClick}
      >
        {/* Cover Image Placeholder or Actual */}
        <div className="absolute inset-0 bg-secondary flex items-center justify-center overflow-hidden">
          <div className="flex flex-col items-center gap-2 text-muted-foreground transition-transform duration-500 group-hover:scale-110">
            <FolderOpen className="h-12 w-12 opacity-20" />
          </div>
          {/* If we had a cover image URL, we'd use it here */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
        </div>

        {/* Red accent bar */}
        <div className="absolute top-0 left-0 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <div className="space-y-1">
            <h3 className="font-heading text-2xl font-bold leading-tight tracking-tight text-primary">{album.title}</h3>
            <div className="flex items-center gap-3 text-xs font-medium text-white/70">
              <span className="flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                Photos
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(album.date), 'MMM yyyy')}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        {isAdmin && onDelete && (
          <div className="absolute top-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8 rounded-full shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(album.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Hover View Label */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="rounded-full bg-white/20 px-4 py-2 text-sm font-bold text-white backdrop-blur-md border border-white/30">
            View Album
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
