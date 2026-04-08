import { Album, Photo } from '@/types';

// Simple mock storage using LocalStorage
const STORAGE_KEY_ALBUMS = 'cecydar_albums_v2';
const STORAGE_KEY_PHOTOS = 'cecydar_photos_v2';

export const storage = {
  testConnection: async () => {
    // No-op for local storage
    return true;
  },

  getAlbums: (callback: (albums: Album[]) => void) => {
    const data = localStorage.getItem(STORAGE_KEY_ALBUMS);
    const albums = data ? JSON.parse(data) : [];
    callback(albums);
    // Return a dummy unsubscribe function
    return () => {};
  },
  
  saveAlbum: async (album: Omit<Album, 'id' | 'createdAt'>): Promise<string> => {
    const data = localStorage.getItem(STORAGE_KEY_ALBUMS);
    const albums = data ? JSON.parse(data) : [];
    const id = Math.random().toString(36).substr(2, 9);
    const newAlbum: Album = {
      ...album,
      id,
      createdAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY_ALBUMS, JSON.stringify([newAlbum, ...albums]));
    return id;
  },

  deleteAlbum: async (id: string) => {
    const albumsData = localStorage.getItem(STORAGE_KEY_ALBUMS);
    const albums = albumsData ? JSON.parse(albumsData) : [];
    const filteredAlbums = albums.filter((a: Album) => a.id !== id);
    localStorage.setItem(STORAGE_KEY_ALBUMS, JSON.stringify(filteredAlbums));

    const photosData = localStorage.getItem(STORAGE_KEY_PHOTOS);
    const photos = photosData ? JSON.parse(photosData) : [];
    const filteredPhotos = photos.filter((p: Photo) => p.albumId !== id);
    localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(filteredPhotos));
  },

  getPhotosByAlbum: (albumId: string, callback: (photos: Photo[]) => void) => {
    const data = localStorage.getItem(STORAGE_KEY_PHOTOS);
    const photos = data ? JSON.parse(data) : [];
    const filtered = photos.filter((p: Photo) => p.albumId === albumId);
    callback(filtered);
    return () => {};
  },

  uploadPhoto: async (albumId: string, file: File): Promise<void> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const data = localStorage.getItem(STORAGE_KEY_PHOTOS);
        const photos = data ? JSON.parse(data) : [];
        
        const newPhoto: Photo = {
          id: Math.random().toString(36).substr(2, 9),
          albumId,
          url,
          name: file.name,
          size: file.size,
          type: file.type,
          createdAt: Date.now(),
        };
        
        localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify([newPhoto, ...photos]));
        resolve();
      };
      reader.readAsDataURL(file);
    });
  },

  deletePhoto: async (id: string, _url: string) => {
    const data = localStorage.getItem(STORAGE_KEY_PHOTOS);
    const photos = data ? JSON.parse(data) : [];
    const filtered = photos.filter((p: Photo) => p.id !== id);
    localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(filtered));
  }
};
