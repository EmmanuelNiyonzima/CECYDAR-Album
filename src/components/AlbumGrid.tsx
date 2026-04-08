import React from 'react';
import { Plus, FolderOpen, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlbumCard } from './AlbumCard';
import { Album } from '@/types';
import { motion } from 'motion/react';

interface AlbumGridProps {
  albums: Album[];
  isAdmin: boolean;
  onAlbumClick: (id: string) => void;
  onAddAlbum: () => void;
  onDeleteAlbum: (id: string) => void;
}

export function AlbumGrid({ albums, isAdmin, onAlbumClick, onAddAlbum, onDeleteAlbum }: AlbumGridProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
            <div className="h-1 w-6 bg-primary" />
            Collections
          </div>
          <h2 className="font-heading text-5xl font-extrabold tracking-tight text-primary">Activities</h2>
          <p className="text-muted-foreground text-lg max-w-xl">
            Explore the life and mission of CECYDAR through our curated photo collections.
          </p>
        </div>
        
        {isAdmin && (
          <Button 
            onClick={onAddAlbum} 
            className="hidden md:flex font-bold px-8 h-12 shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Album
          </Button>
        )}
      </div>

      {albums.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {albums.map((album) => (
            <div key={album.id}>
              <AlbumCard
                album={album}
                isAdmin={isAdmin}
                onClick={() => onAlbumClick(album.id)}
                onDelete={onDeleteAlbum}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed bg-secondary/10 p-12 text-center">
          <div className="mb-4 rounded-full bg-secondary p-6">
            <ImageIcon className="h-12 w-12 text-muted-foreground opacity-20" />
          </div>
          <h3 className="mb-2 text-2xl font-bold">No albums yet</h3>
          <p className="mb-8 text-muted-foreground max-w-sm">
            Start by creating your first photo album to organize your memories.
          </p>
          {isAdmin && (
            <Button onClick={onAddAlbum} size="lg" className="font-bold px-8">
              <Plus className="mr-2 h-5 w-5" />
              Create First Album
            </Button>
          )}
        </div>
      )}

      {/* Floating Action Button for Admin */}
      {isAdmin && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onAddAlbum}
          className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 md:hidden"
        >
          <Plus className="h-8 w-8" />
        </motion.button>
      )}
    </div>
  );
}
