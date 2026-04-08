import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  orderBy,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage as firebaseStorage, auth } from './firebase';
import { Album, Photo } from '@/types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const storage = {
  testConnection: async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if(error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration. ");
      }
    }
  },

  getAlbums: (callback: (albums: Album[]) => void) => {
    const q = query(collection(db, 'albums'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const albums = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Album));
      callback(albums);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'albums');
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
      // Delete album doc
      await deleteDoc(doc(db, 'albums', id));
      
      // Find and delete associated photos
      const q = query(collection(db, 'photos'), where('albumId', '==', id));
      const snapshot = await getDocs(q);
      
      for (const photoDoc of snapshot.docs) {
        const photo = photoDoc.data() as Photo;
        // Delete from storage if it's a firebase storage URL
        if (photo.url.includes('firebasestorage')) {
          try {
            const imageRef = ref(firebaseStorage, photo.url);
            await deleteObject(imageRef);
          } catch (e) {
            console.error('Failed to delete image from storage', e);
          }
        }
        await deleteDoc(doc(db, 'photos', photoDoc.id));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `albums/${id}`);
    }
  },

  getPhotosByAlbum: (albumId: string, callback: (photos: Photo[]) => void) => {
    const q = query(collection(db, 'photos'), where('albumId', '==', albumId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const photos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
      callback(photos);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `photos?albumId=${albumId}`);
    });
  },

  uploadPhoto: async (albumId: string, file: File): Promise<void> => {
    try {
      const storagePath = `albums/${albumId}/${Date.now()}_${file.name}`;
      const imageRef = ref(firebaseStorage, storagePath);
      
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      
      await addDoc(collection(db, 'photos'), {
        albumId,
        url,
        name: file.name,
        size: file.size,
        type: file.type,
        createdAt: Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'photos');
    }
  },

  deletePhoto: async (id: string, url: string) => {
    try {
      if (url.includes('firebasestorage')) {
        const imageRef = ref(firebaseStorage, url);
        await deleteObject(imageRef);
      }
      await deleteDoc(doc(db, 'photos', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `photos/${id}`);
    }
  }
};
