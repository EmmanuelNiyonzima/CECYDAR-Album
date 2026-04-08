import React, { useState } from 'react';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'album' | 'photos';
  onUpload: (data: any) => Promise<void>;
}

export function UploadModal({ isOpen, onClose, type, onUpload }: UploadModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [files, setFiles] = useState<FileList | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (type === 'album') {
        await onUpload({ title, description, date });
      } else {
        if (files) {
          await onUpload(files);
        }
      }
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setFiles(null);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{type === 'album' ? 'Create New Album' : 'Upload Photos'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {type === 'album' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Album Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Summer Camp 2024"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What was this activity about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors hover:bg-secondary/50">
                <ImageIcon className="mb-4 h-10 w-10 text-muted-foreground" />
                <Label htmlFor="photos" className="cursor-pointer font-semibold text-primary hover:underline">
                  Click to select photos
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG or WEBP (max. 10MB each)</p>
                <Input
                  id="photos"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFiles(e.target.files)}
                  required
                />
              </div>
              {files && (
                <div className="text-sm font-medium">
                  {files.length} files selected
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading || (type === 'photos' && !files)}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
