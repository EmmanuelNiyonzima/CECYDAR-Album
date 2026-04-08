import React from 'react';
import { Plus, FolderOpen } from 'lucide-react';
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-4xl font-bold tracking-tight">Activities & Albums</h2>
          <p className="text-muted-foreground">Browse through CECYDAR's history and events.</p>
        </div>
        {isAdmin && (
          <Button onClick={onAddAlbum} className="gap-2">
            <Plus className="h-4 w-4" />
            New Album
          </Button>
        )}
      </div>

      {albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <FolderOpen className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold">No albums yet</h3>
          <p className="mt-1 text-muted-foreground">
            {isAdmin ? "Click the button above to create your first album." : "Check back later for new photos."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      )}
    </div>
  );
}
