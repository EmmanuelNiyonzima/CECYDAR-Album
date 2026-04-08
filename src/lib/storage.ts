import { Album, Photo } from '@/types';
import { 
  db, 
  storage_bucket,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
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
      // Get associated photos to delete from Storage first
      const q = query(collection(db, 'photos'), where('albumId', '==', id));
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(async (d) => {
        const photoData = d.data();
        // Delete from Storage
        try {
          const storageRef = ref(storage_bucket, `photos/${d.id}`);
          await deleteObject(storageRef);
        } catch (e) {
          console.warn('Could not delete file from storage:', e);
        }
        // Delete from Firestore
        return deleteDoc(doc(db, 'photos', d.id));
      });
      
      await Promise.all(deletePromises);
      
      // Delete album
      await deleteDoc(doc(db, 'albums', id));
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

  uploadPhoto: async (albumId: string, file: File): Promise<void> => {
    try {
      // 1. Pre-generate a Firestore document reference to get a unique ID
      const photoDocRef = doc(collection(db, 'photos'));
      const photoId = photoDocRef.id;

      // 2. Upload to Firebase Storage using this ID as the filename
      const storageRef = ref(storage_bucket, `photos/${photoId}`);
      await uploadBytes(storageRef, file);

      // 3. Get the download URL
      const downloadUrl = await getDownloadURL(storageRef);

      // 4. Create the Firestore document with the URL
      // We use setDoc because we already have the doc reference with the ID
      await setDoc(photoDocRef, {
        albumId,
        url: downloadUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        createdAt: Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'photos');
      throw error;
    }
  },

  deletePhoto: async (id: string, _url: string) => {
    try {
      // Delete from Storage
      try {
        const storageRef = ref(storage_bucket, `photos/${id}`);
        await deleteObject(storageRef);
      } catch (e) {
        console.warn('Could not delete file from storage:', e);
      }
      // Delete from Firestore
      await deleteDoc(doc(db, 'photos', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `photos/${id}`);
    }
  }
};
