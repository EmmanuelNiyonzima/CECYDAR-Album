import { Album, Photo } from '@/types';
import { 
  db, 
  storage_bucket,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  OperationType, 
  handleFirestoreError,
  auth,
  testFirestoreConnection
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
  getDoc,
  serverTimestamp
} from 'firebase/firestore';

export const storage = {
  testConnection: async () => {
    try {
      await testFirestoreConnection();
      return true;
    } catch (e) {
      console.error('Connection test failed:', e);
      return false;
    }
  },

  getAlbums: (callback: (albums: Album[]) => void) => {
    console.log('Fetching albums...');
    const q = query(collection(db, 'albums'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      console.log(`Received ${snapshot.size} albums`);
      const albums = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Album));
      callback(albums);
    }, (error) => {
      console.error('getAlbums error:', error);
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
    console.log(`Starting deletion of album: ${id}`);
    try {
      // 1. Get all photos in the album
      const q = query(collection(db, 'photos'), where('albumId', '==', id));
      const snapshot = await getDocs(q);
      console.log(`Found ${snapshot.size} photos to delete for album ${id}`);
      
      // 2. Delete each photo from Storage and Firestore
      const deletePromises = snapshot.docs.map(async (photoDoc) => {
        const photoId = photoDoc.id;
        console.log(`Deleting photo: ${photoId}`);
        // Delete from Storage
        const storageRef = ref(storage_bucket, `photos/${photoId}`);
        try {
          await deleteObject(storageRef);
          console.log(`Deleted from Storage: ${photoId}`);
        } catch (e) {
          console.warn(`Storage object already deleted or missing for ${photoId}:`, e);
        }
        // Delete from Firestore
        await deleteDoc(doc(db, 'photos', photoId));
        console.log(`Deleted from Firestore: ${photoId}`);
      });
      
      await Promise.all(deletePromises);
      console.log('All photos deleted, now deleting album record...');
      
      // 3. Delete the album itself
      await deleteDoc(doc(db, 'albums', id));
      console.log(`Album ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting album ${id}:`, error);
      handleFirestoreError(error, OperationType.DELETE, `albums/${id}`);
      throw error;
    }
  },

  getPhotosByAlbum: (albumId: string, callback: (photos: Photo[]) => void) => {
    console.log(`Fetching photos for album: ${albumId}`);
    const q = query(
      collection(db, 'photos'), 
      where('albumId', '==', albumId)
    );
    return onSnapshot(q, (snapshot) => {
      console.log(`Received ${snapshot.size} photos for album ${albumId}`);
      const photos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
      // Sort client-side to avoid needing a composite index in Firestore
      photos.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(photos);
    }, (error) => {
      console.error(`getPhotosByAlbum error for ${albumId}:`, error);
      handleFirestoreError(error, OperationType.LIST, `photos?albumId=${albumId}`);
    });
  },

  uploadPhoto: async (albumId: string, file: File, onProgress?: (progress: number) => void): Promise<void> => {
    console.log(`[STORAGE] Starting upload for: ${file.name} to album: ${albumId}`);
    
    try {
      if (!auth.currentUser) {
        console.error('[STORAGE] User not authenticated');
        throw new Error('Please login before uploading photos.');
      }

      // Fetch album details to get the name for 'eventName'
      const albumDoc = await getDoc(doc(db, 'albums', albumId));
      const albumData = albumDoc.data();
      const eventName = albumData?.title || "General";

      // 1. Pre-generate ID
      const photoDocRef = doc(collection(db, 'photos'));
      const photoId = photoDocRef.id;
      
      // 2. Upload to Firebase Storage with organized path: photos/{albumId}/{photoId}_{fileName}
      const storagePath = `photos/${albumId}/${photoId}_${file.name}`;
      const storageRef = ref(storage_bucket, storagePath);
      
      console.log(`[STORAGE] Uploading to: ${storagePath}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        // Initial progress to show activity
        if (onProgress) onProgress(1);

        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`[STORAGE] Progress for ${file.name}: ${Math.round(progress)}%`);
            if (onProgress) onProgress(progress || 1); // Ensure at least 1% to show it started
          }, 
          (error) => {
            console.error('[STORAGE] Task error:', error);
            handleFirestoreError(error, OperationType.CREATE, `storage/${storagePath}`);
            reject(error);
          }, 
          async () => {
            console.log(`[STORAGE] Upload complete for ${file.name}. Getting download URL...`);
            try {
              // 3. Get the real browser URL (not gs://)
              const downloadUrl = await getDownloadURL(storageRef);
              console.log(`[STORAGE] Download URL: ${downloadUrl}`);

              // 4. Save metadata to Firestore
              console.log('[STORAGE] Saving to Firestore...');
              await setDoc(photoDocRef, {
                albumId,
                url: downloadUrl,
                imageUrl: downloadUrl, // specifically asked for imageUrl field
                name: file.name,
                fileName: file.name, // specifically asked for fileName field
                storagePath: storagePath, // specifically asked for storagePath field
                size: file.size,
                type: file.type,
                createdAt: Date.now(),
                uploadedAt: serverTimestamp(), // specifically asked for uploadedAt
                uploadedBy: auth.currentUser?.uid,
                uploaderEmail: auth.currentUser?.email,
                eventName: eventName
              });
              
              console.log('[STORAGE] Firestore record saved successfully');
              if (onProgress) onProgress(100);
              resolve();
            } catch (error) {
              console.error('[STORAGE] Post-upload error:', error);
              handleFirestoreError(error, OperationType.CREATE, 'photos/metadata');
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('[STORAGE] uploadPhoto failed:', error);
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
