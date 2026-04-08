import React, { useState, useEffect, ErrorInfo, ReactNode } from 'react';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import { AlbumGrid } from './components/AlbumGrid';
import { AlbumDetail } from './components/AlbumDetail';
import { UploadModal } from './components/UploadModal';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { storage } from './lib/storage';
import { Album, Photo, User } from './types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      try {
        const errObj = JSON.parse(this.state.error.message);
        if (errObj.error) message = `Permission Denied: ${errObj.operationType} on ${errObj.path}`;
      } catch (e) {
        message = this.state.error.message || message;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
          <h1 className="mb-2 text-2xl font-bold">Application Error</h1>
          <p className="mb-6 max-w-md text-muted-foreground">{message}</p>
          <Button onClick={() => window.location.reload()} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
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

  // Auth listener
  useEffect(() => {
    const savedUser = localStorage.getItem('cecydar_user_v2');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsAuthReady(true);
  }, []);

  // Connection test
  useEffect(() => {
    if (isAuthReady && user) {
      storage.testConnection();
    }
  }, [isAuthReady, user]);

  // Real-time albums listener
  useEffect(() => {
    const unsubscribe = storage.getAlbums((data) => setAlbums(data));
    return () => unsubscribe();
  }, []);

  // Real-time photos listener
  useEffect(() => {
    if (!selectedAlbumId) return;
    const unsubscribe = storage.getPhotosByAlbum(selectedAlbumId, (data) => setPhotos(data));
    return () => unsubscribe();
  }, [selectedAlbumId]);

  const handleLogin = (email: string) => {
    const newUser: User = {
      email,
      isAdmin: email.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
    };
    setUser(newUser);
    localStorage.setItem('cecydar_user_v2', JSON.stringify(newUser));
    setView('home');
    toast.success(`Logged in as ${newUser.isAdmin ? 'Admin' : 'User'}`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cecydar_user_v2');
    setView('home');
    toast.info('Logged out successfully');
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
    if (confirm('Are you sure you want to delete this album and all its photos?')) {
      await storage.deleteAlbum(id);
      toast.success('Album deleted');
    }
  };

  const handleDeletePhoto = async (id: string) => {
    const photoToDelete = photos.find(p => p.id === id);
    if (photoToDelete && confirm('Delete this photo?')) {
      await storage.deletePhoto(id, photoToDelete.url);
      toast.success('Photo deleted');
    }
  };

  const handleUpload = async (data: any) => {
    if (uploadType === 'album') {
      await storage.saveAlbum(data);
      toast.success('Album created successfully');
    } else {
      const files = Array.from(data as FileList);
      const total = files.length;
      let completed = 0;
      
      const uploadToast = toast.loading(`Uploading 0/${total} photos...`);
      
      try {
        // Sequential upload to avoid memory issues with thousands of images
        for (const file of files) {
          await storage.uploadPhoto(selectedAlbumId!, file);
          completed++;
          toast.loading(`Uploading ${completed}/${total} photos...`, { id: uploadToast });
        }
        
        toast.success(`Successfully uploaded ${total} images!`, { id: uploadToast });
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error(`Upload failed after ${completed} images.`, { id: uploadToast });
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
            isAuthenticated={!!user}
            onBack={() => setView('home')}
            onUploadPhotos={handleUploadPhotos}
            onDeletePhoto={handleDeletePhoto}
            onPreviewPhoto={(p, url) => setPreviewPhoto({ ...p, url })}
            onAuthRequired={() => {
              toast.error('Please login to download photos');
              setView('login');
            }}
          />
        )}
      </main>

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
