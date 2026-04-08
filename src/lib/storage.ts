import { Album, Photo } from '@/types';
import { get, set, update, del } from 'idb-keyval';

// Keys for IndexedDB
const STORAGE_KEY_ALBUMS = 'cecydar_albums_v3';
const STORAGE_KEY_PHOTOS_INDEX = 'cecydar_photos_index_v3'; // Stores metadata/ids

export const storage = {
  testConnection: async () => {
    return true;
  },

  getAlbums: (callback: (albums: Album[]) => void) => {
    get<Album[]>(STORAGE_KEY_ALBUMS).then((albums) => {
      callback(albums || []);
    });
    return () => {};
  },
  
  saveAlbum: async (album: Omit<Album, 'id' | 'createdAt'>): Promise<string> => {
    const id = Math.random().toString(36).substr(2, 9);
    const newAlbum: Album = {
      ...album,
      id,
      createdAt: Date.now(),
    };
    
    await update<Album[]>(STORAGE_KEY_ALBUMS, (old) => [newAlbum, ...(old || [])]);
    return id;
  },

  deleteAlbum: async (id: string) => {
    // Delete album from index
    await update<Album[]>(STORAGE_KEY_ALBUMS, (old) => (old || []).filter(a => a.id !== id));
    
    // Get all photo IDs for this album
    const photoIndex = await get<Photo[]>(STORAGE_KEY_PHOTOS_INDEX) || [];
    const albumPhotos = photoIndex.filter(p => p.albumId === id);
    
    // Delete each photo from IndexedDB
    for (const photo of albumPhotos) {
      await del(`photo_data_${photo.id}`);
    }
    
    // Update photo index
    await set(STORAGE_KEY_PHOTOS_INDEX, photoIndex.filter(p => p.albumId !== id));
  },

  getPhotosByAlbum: (albumId: string, callback: (photos: Photo[]) => void) => {
    get<Photo[]>(STORAGE_KEY_PHOTOS_INDEX).then((photos) => {
      const filtered = (photos || []).filter((p) => p.albumId === albumId);
      callback(filtered);
    });
    return () => {};
  },

  getPhotoData: async (id: string): Promise<string | undefined> => {
    return get<string>(`photo_data_${id}`);
  },

  uploadPhoto: async (albumId: string, file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const dataUrl = e.target?.result as string;
          const id = Math.random().toString(36).substr(2, 9);
          
          // Store the actual image data separately
          await set(`photo_data_${id}`, dataUrl);
          
          const newPhoto: Photo = {
            id,
            albumId,
            url: '', // We'll fetch this on demand or use a placeholder
            name: file.name,
            size: file.size,
            type: file.type,
            createdAt: Date.now(),
          };
          
          // Update the index (metadata only)
          await update<Photo[]>(STORAGE_KEY_PHOTOS_INDEX, (old) => [newPhoto, ...(old || [])]);
          
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsDataURL(file);
    });
  },

  deletePhoto: async (id: string, _url: string) => {
    await update<Photo[]>(STORAGE_KEY_PHOTOS_INDEX, (old) => (old || []).filter(p => p.id !== id));
    await del(`photo_data_${id}`);
  }
};
