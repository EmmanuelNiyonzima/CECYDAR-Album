import { Album, Photo } from '@/types';
import { 
  db, 
  OperationType, 
  handleFirestoreError 
} from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  setDoc,
  getDoc
} from 'firebase/firestore';

export const storage = {
  testConnection: async () => {
    try {
      const { testFirestoreConnection } = await import('./firebase');
      await testFirestoreConnection();
      return true;
    } catch (e) {
      return false;
    }
  },

  getAlbums: (callback: (albums: Album[]) => void) => {
    const q = query(collection(db, 'albums'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const albums = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Album));
      callback(albums);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'albums');
    });
  },
  
  saveAlbum: async (album: Omit<Album, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'albums'), {
        ...album,
        createdAt: Date.now(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'albums');
      return '';
    }
  },

  deleteAlbum: async (id: string) => {
    try {
      // Delete album
      await deleteDoc(doc(db, 'albums', id));
      
      // Delete associated photos
      const q = query(collection(db, 'photos'), where('albumId', '==', id));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'photos', d.id)));
      await Promise.all(deletePromises);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `albums/${id}`);
    }
  },

  getPhotosByAlbum: (albumId: string, callback: (photos: Photo[]) => void) => {
    const q = query(
      collection(db, 'photos'), 
      where('albumId', '==', albumId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const photos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
      callback(photos);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `photos?albumId=${albumId}`);
    });
  },

  getPhotoData: async (id: string): Promise<string | undefined> => {
    try {
      const docSnap = await getDoc(doc(db, 'photos', id));
      if (docSnap.exists()) {
        return docSnap.data().url;
      }
      return undefined;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `photos/${id}`);
      return undefined;
    }
  },

  uploadPhoto: async (albumId: string, file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const dataUrl = e.target?.result as string;
          
          await addDoc(collection(db, 'photos'), {
            albumId,
            url: dataUrl,
            name: file.name,
            size: file.size,
            type: file.type,
            createdAt: Date.now(),
          });
          
          resolve();
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'photos');
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsDataURL(file);
    });
  },

  deletePhoto: async (id: string, _url: string) => {
    try {
      await deleteDoc(doc(db, 'photos', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `photos/${id}`);
    }
  }
};
