import React from 'react';
import { ArrowLeft, Upload, Download, Trash2, ImageIcon, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageCard } from './ImageCard';
import { Album, Photo } from '@/types';
import { storage } from '@/lib/storage';
import { motion } from 'motion/react';
import JSZip from 'jszip';
import Masonry from 'react-masonry-css';

interface AlbumDetailProps {
  album: Album;
  photos: Photo[];
  isAdmin: boolean;
  isAuthenticated: boolean;
  onBack: () => void;
  onUploadPhotos: () => void;
  onDeletePhoto: (id: string) => void;
  onDeleteAlbum: () => void;
  onPreviewPhoto: (photo: Photo, url: string) => void;
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
  onDeleteAlbum,
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
        const data = await storage.getPhotoData(photo.id);
        if (data) {
          // Convert data URL to blob
          const response = await fetch(data);
          const blob = await response.blob();
          folder.file(photo.name, blob);
        }
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

  const breakpointColumnsObj = {
    default: 5,
    1400: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-12">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack} 
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Albums
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-1 bg-primary rounded-full" />
              <h2 className="font-heading text-5xl font-extrabold tracking-tight text-primary">{album.title}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                {photos.length} photos
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created {new Date(album.date).toLocaleDateString()}
              </span>
            </div>
            <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
              {album.description || "A beautiful collection of moments from CECYDAR."}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="font-bold px-6 border-2 hover:bg-secondary"
              onClick={handleDownloadAll}
            >
              <Download className="mr-2 h-4 w-4" />
              Download All
            </Button>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Button 
                  onClick={onUploadPhotos}
                  className="font-bold px-6 shadow-lg shadow-primary/20"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Photos
                </Button>
                <Button 
                  variant="destructive"
                  size="icon"
                  className="h-10 w-10 rounded-lg shadow-lg shadow-destructive/20"
                  onClick={onDeleteAlbum}
                  title="Delete Album"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Masonry Photo Grid */}
      {photos.length > 0 ? (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex w-auto -ml-4"
          columnClassName="pl-4 bg-clip-padding"
        >
          {photos.map((photo) => (
            <div key={photo.id}>
              <ImageCard
                photo={photo}
                isAdmin={isAdmin}
                isAuthenticated={isAuthenticated}
                onPreview={(url) => onPreviewPhoto(photo, url)}
                onDelete={onDeletePhoto}
                onAuthRequired={onAuthRequired}
              />
            </div>
          ))}
        </Masonry>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-secondary/20 p-12 text-center">
          <div className="mb-4 rounded-full bg-secondary p-4">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-bold">No photos yet</h3>
          <p className="mb-6 text-muted-foreground">This album is waiting for its first memories.</p>
          {isAdmin && (
            <Button onClick={onUploadPhotos} className="font-bold">
              <Plus className="mr-2 h-4 w-4" />
              Upload first photo
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
