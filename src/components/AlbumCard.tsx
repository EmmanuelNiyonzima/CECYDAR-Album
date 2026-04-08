import React from 'react';
import { Calendar, Image as ImageIcon, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="group relative h-full cursor-pointer overflow-hidden border-none bg-secondary/50 shadow-none transition-all hover:bg-secondary hover:shadow-xl"
        onClick={onClick}
      >
        <div className="absolute top-0 left-0 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background text-primary shadow-sm">
              <ImageIcon className="h-6 w-6" />
            </div>
            {isAdmin && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(album.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <h3 className="font-heading text-2xl font-bold leading-tight">{album.title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {album.description || "No description provided."}
          </p>
        </CardContent>
        <CardFooter className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(album.date), 'MMMM dd, yyyy')}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
