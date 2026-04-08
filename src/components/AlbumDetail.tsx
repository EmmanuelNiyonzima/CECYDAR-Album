import React from 'react';
import { ArrowLeft, Upload, Download, Trash2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageCard } from './ImageCard';
import { Album, Photo } from '@/types';
import { motion } from 'motion/react';
import JSZip from 'jszip';

interface AlbumDetailProps {
  album: Album;
  photos: Photo[];
  isAdmin: boolean;
  isAuthenticated: boolean;
  onBack: () => void;
  onUploadPhotos: () => void;
  onDeletePhoto: (id: string) => void;
  onPreviewPhoto: (photo: Photo) => void;
  onAuthRequired: () => void;
}

export function AlbumDetail({ 
  album, 
  photos, 
  isAdmin, 
  isAuthenticated,
  onBack, 
  onUploadPhotos, 
  onDeletePhoto,
  onPreviewPhoto,
  onAuthRequired
}: AlbumDetailProps) {
  
  const handleDownloadAll = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    const zip = new JSZip();
    const folder = zip.folder(album.title);
    
    if (!folder) return;

    for (const photo of photos) {
      try {
        const response = await fetch(photo.url);
        const blob = await response.blob();
        folder.file(photo.name, blob);
      } catch (error) {
        console.error(`Failed to download ${photo.name}:`, error);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = window.URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${album.title}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">

      <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack} 
            className="-ml-2 gap-2 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Albums
          </Button>
          <div className="space-y-1">
            <div className="h-1 w-12 bg-primary" />
            <h2 className="font-heading text-5xl font-bold tracking-tight">{album.title}</h2>
            <p className="max-w-2xl text-lg text-muted-foreground">{album.description}</p>
            <div className="mt-4 flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <span>{photos.length} Photos</span>
              <span>•</span>
              <span>{new Date(album.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {photos.length > 0 && (
            <Button variant="outline" onClick={handleDownloadAll} className="gap-2">
              <Download className="h-4 w-4" />
              Download All
            </Button>
          )}
          {isAdmin && (
            <Button onClick={onUploadPhotos} className="gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95">
              <Upload className="h-4 w-4" />
              Upload Photos
            </Button>
          )}
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold">No photos in this album</h3>
          <p className="mt-1 text-muted-foreground">
            {isAdmin ? "Click the upload button to add some photos." : "Check back later for updates."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {photos.map((photo) => (
            <div key={photo.id}>
              <ImageCard
                photo={photo}
                isAdmin={isAdmin}
                isAuthenticated={isAuthenticated}
                onPreview={() => onPreviewPhoto(photo)}
                onDelete={onDeletePhoto}
                onAuthRequired={onAuthRequired}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
