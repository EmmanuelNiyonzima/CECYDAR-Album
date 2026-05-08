import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import { AlbumGrid } from './components/AlbumGrid';
import { AlbumDetail } from './components/AlbumDetail';
import { UploadModal } from './components/UploadModal';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { storage } from './lib/storage';
import { auth, db, googleProvider } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Album, Photo, User } from './types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from './components/ConfirmDialog';

const ADMIN_EMAIL = 'niyonzimaemmanuel85@gmail.com';

class ErrorBoundary extends React.Component<any, any> {
  public state: any;
  public props: any;

  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let message = "Something went wrong.";
      let details = "";
      
      if (this.state.error) {
        if (typeof this.state.error === 'string') {
          message = this.state.error;
        } else if (this.state.error.message) {
          details = this.state.error.message;
          try {
            const errObj = JSON.parse(this.state.error.message);
            if (errObj.error) {
              message = `Permission Denied: ${errObj.operationType} on ${errObj.path}`;
              details = errObj.error;
            }
          } catch (e) {
            message = this.state.error.message;
          }
        }
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-background text-foreground">
          <div className="mb-6 rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight">Application Error</h1>
          <p className="mb-4 max-w-md text-lg text-muted-foreground">{message}</p>
          {details && details !== message && (
            <pre className="mb-8 max-w-lg overflow-auto rounded-lg bg-muted p-4 text-left text-xs text-muted-foreground">
              {details}
            </pre>
          )}
          <Button onClick={() => window.location.reload()} className="gap-2 font-bold px-8 h-12">
            <RefreshCcw className="h-5 w-5" />
            Reload Application
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [view, setView] = useState<'home' | 'album' | 'login'>('home');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'album' | 'photos'>('album');
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant: 'default' | 'destructive';
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    variant: 'default'
  });

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        let isAdmin = firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        let isContributor = isAdmin;
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          isAdmin = userData.role === 'admin' || isAdmin;
          isContributor = userData.role === 'contributor' || isAdmin;
        } else {
          // Initialize user in Firestore
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            email: firebaseUser.email,
            role: isAdmin ? 'admin' : 'user'
          });
        }

        setUser({
          email: firebaseUser.email,
          isAdmin: isAdmin,
          isContributor: isContributor,
          uid: firebaseUser.uid
        });
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Connection test
  useEffect(() => {
    if (isAuthReady) {
      storage.testConnection();
    }
  }, [isAuthReady]);

  // Real-time albums listener
  useEffect(() => {
    const unsubscribe = storage.getAlbums((data) => setAlbums(data));
    return () => unsubscribe();
  }, []);

  // Real-time photos listener
  useEffect(() => {
    if (!selectedAlbumId) return;
    console.log(`Subscribing to photos for album ${selectedAlbumId}`);
    const unsubscribe = storage.getPhotosByAlbum(selectedAlbumId, (data) => {
      console.log(`Received ${data.length} photos for album ${selectedAlbumId}`);
      setPhotos(data);
    });
    return () => unsubscribe();
  }, [selectedAlbumId]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setView('home');
      toast.success('Logged in successfully');
    } catch (error: any) {
      console.error('Login failed:', error);
      let message = 'Login failed. Please try again.';
      
      if (error.code === 'auth/unauthorized-domain') {
        message = 'Domain not authorized. Please check Firebase Console.';
      } else if (error.code === 'auth/popup-blocked') {
        message = 'Popup blocked by browser. Please allow popups.';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'Google Login is not enabled in Firebase Console.';
      }
      
      toast.error(message, {
        description: error.message
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView('home');
      toast.info('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAlbumClick = (id: string) => {
    setSelectedAlbumId(id);
    setView('album');
  };

  const handleAddAlbum = () => {
    setUploadType('album');
    setIsUploadModalOpen(true);
  };

  const handleUploadPhotos = () => {
    setUploadType('photos');
    setIsUploadModalOpen(true);
  };

  const handleDeleteAlbum = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Album?",
      description: "This will permanently delete the album and all photos inside it. This action cannot be undone.",
      variant: 'destructive',
      onConfirm: async () => {
        await storage.deleteAlbum(id);
        toast.success('Album deleted');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        if (selectedAlbumId === id) setView('home');
      }
    });
  };

  const handleDeletePhoto = async (id: string) => {
    const photoToDelete = photos.find(p => p.id === id);
    if (!photoToDelete) return;

    setConfirmDialog({
      isOpen: true,
      title: "Delete Photo?",
      description: "Are you sure you want to delete this photo?",
      variant: 'destructive',
      onConfirm: async () => {
        await storage.deletePhoto(id, photoToDelete.url);
        toast.success('Photo deleted');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleUpload = async (data: any) => {
    if (uploadType === 'album') {
      await storage.saveAlbum(data);
      toast.success('Album created successfully');
    } else {
      if (!selectedAlbumId) {
        toast.error('No album selected for upload');
        return;
      }

      const files = Array.from(data as FileList);
      const total = files.length;
      let completed = 0;
      let failed = 0;
      
      console.log(`Starting bulk upload of ${total} files to album ${selectedAlbumId}`);
      const uploadToast = toast.loading(`Uploading 0/${total} photos...`);
      
      try {
        // Use a map to track progress of each file
        const progressMap = new Map<number, number>();
        
        const uploadPromises = files.map(async (file, index) => {
          try {
            console.log(`Processing file ${index + 1}/${total}: ${file.name}`);
            // Add a timeout to each individual upload (increased to 5 minutes)
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Upload for ${file.name} timed out after 5 minutes`)), 300000)
            );

            const uploadPromise = storage.uploadPhoto(selectedAlbumId!, file, (progress) => {
              progressMap.set(index, progress);
              const totalProgress = Array.from(progressMap.values()).reduce((a, b) => a + b, 0) / total;
              toast.loading(`Uploading ${completed}/${total} photos (${Math.round(totalProgress)}%)...`, { id: uploadToast });
            });

            await Promise.race([uploadPromise, timeoutPromise]);
            completed++;
            console.log(`Successfully uploaded ${file.name}`);
          } catch (error) {
            console.error(`Failed to upload file ${index} (${file.name}):`, error);
            failed++;
          } finally {
            toast.loading(`Uploading ${completed + failed}/${total} photos...`, { id: uploadToast });
          }
        });

        await Promise.all(uploadPromises);
        console.log(`Bulk upload finished. Completed: ${completed}, Failed: ${failed}`);
        
        if (failed === 0) {
          toast.success(`Successfully uploaded ${total} images!`, { 
            id: uploadToast,
            description: "All photos are now available in the album."
          });
        } else if (completed > 0) {
          toast.error(`Upload completed with issues`, {
            id: uploadToast,
            description: `Successfully uploaded ${completed} photos. ${failed} photos failed to upload.`
          });
        } else {
          toast.error(`Upload failed`, {
            id: uploadToast,
            description: `All ${failed} photos failed to upload. Please check your connection.`
          });
        }
      } catch (error) {
        console.error('Bulk upload process error:', error);
        toast.error('An unexpected error occurred during upload', { id: uploadToast });
      }
    }
  };

  if (!isAuthReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const selectedAlbum = albums.find(a => a.id === selectedAlbumId);

  const filteredAlbums = albums.filter(album => 
    album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    album.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPhotos = photos.filter(photo =>
    photo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        user={user} 
        onLogin={() => setView('login')} 
        onLogout={handleLogout}
        onGoHome={() => {
          setView('home');
          setSearchQuery('');
        }}
        onSearch={setSearchQuery}
      />

      <main className="pb-20">
        {view === 'login' && <Login onLogin={handleLogin} />}
        
        {view === 'home' && (
          <AlbumGrid 
            albums={filteredAlbums} 
            isAdmin={user?.isAdmin || false}
            onAlbumClick={handleAlbumClick}
            onAddAlbum={handleAddAlbum}
            onDeleteAlbum={handleDeleteAlbum}
          />
        )}

        {view === 'album' && selectedAlbum && (
          <AlbumDetail 
            album={selectedAlbum}
            photos={filteredPhotos}
            isAdmin={user?.isAdmin || false}
            isContributor={user?.isContributor || false}
            isAuthenticated={!!user}
            onBack={() => setView('home')}
            onUploadPhotos={handleUploadPhotos}
            onDeletePhoto={handleDeletePhoto}
            onDeleteAlbum={() => handleDeleteAlbum(selectedAlbumId!)}
            onPreviewPhoto={(p, url) => setPreviewPhoto({ ...p, url })}
            onAuthRequired={() => {
              toast.error('Please login to download photos');
              setView('login');
            }}
          />
        )}
      </main>

      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmText="Delete"
      />

      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        type={uploadType}
        onUpload={handleUpload}
      />

      <ImagePreviewModal 
        photo={previewPhoto}
        isOpen={!!previewPhoto}
        onClose={() => setPreviewPhoto(null)}
        onNext={() => {
          const idx = photos.findIndex(p => p.id === previewPhoto?.id);
          if (idx < photos.length - 1) setPreviewPhoto(photos[idx + 1]);
        }}
        onPrev={() => {
          const idx = photos.findIndex(p => p.id === previewPhoto?.id);
          if (idx > 0) setPreviewPhoto(photos[idx - 1]);
        }}
      />

      <Toaster position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
