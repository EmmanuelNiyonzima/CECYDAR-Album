import React, { useState } from 'react';
import { X, Upload, Loader2, Image as ImageIcon, FolderPlus, Plus, Palette, Lock, Type } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

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
  
  // Customization
  const [titleColor, setTitleColor] = useState('#000000');
  const [titleSize, setTitleSize] = useState('text-5xl');
  const [titleFont, setTitleFont] = useState('font-heading');
  
  // Gated content
  const [isLocked, setIsLocked] = useState(false);
  const [passcode, setPasscode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (type === 'album') {
        await onUpload({ 
          title, 
          description, 
          date,
          titleColor,
          titleSize,
          titleFont,
          isLocked,
          passcode: isLocked ? passcode : ''
        });
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
      setIsLocked(false);
      setPasscode('');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              {type === 'album' ? <FolderPlus className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
            </div>
            <DialogTitle className="text-2xl font-extrabold tracking-tight">
              {type === 'album' ? 'Create New Album' : 'Upload Photos'}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {type === 'album' ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Album Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Summer Camp 2024"
                    className="h-11 border-2 focus-visible:ring-primary"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What was this activity about?"
                    className="min-h-[80px] border-2 focus-visible:ring-primary resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    className="h-11 border-2 focus-visible:ring-primary"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  <Palette className="h-4 w-4" />
                  Customization (Rich Text)
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Title Color</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="color" 
                        value={titleColor} 
                        onChange={(e) => setTitleColor(e.target.value)}
                        className="h-10 w-12 p-1 cursor-pointer"
                      />
                      <span className="text-xs font-mono">{titleColor}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Font Style</Label>
                    <Select value={titleFont} onValueChange={setTitleFont}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="font-heading">Modern Sans</SelectItem>
                        <SelectItem value="font-serif">Classic Serif</SelectItem>
                        <SelectItem value="font-mono">Technical Mono</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-primary">
                    <Lock className="h-4 w-4" />
                    Gated Content
                  </div>
                  <Switch checked={isLocked} onCheckedChange={setIsLocked} />
                </div>
                {isLocked && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="passcode" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Passcode</Label>
                    <Input
                      id="passcode"
                      type="text"
                      placeholder="Enter a code to lock this album"
                      className="h-11 border-2 focus-visible:ring-primary"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      required={isLocked}
                    />
                    <p className="text-[10px] text-muted-foreground">Users must enter this code to view photos in this album.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/20 p-12 text-center transition-all hover:border-primary/50 hover:bg-primary/5 group">
                <div className="mb-4 rounded-full bg-secondary p-4 transition-transform group-hover:scale-110">
                  <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                </div>
                <Label htmlFor="photos" className="cursor-pointer text-lg font-bold text-foreground hover:text-primary transition-colors">
                  Click to select photos
                </Label>
                <p className="mt-2 text-sm text-muted-foreground">PNG, JPG or WEBP (max. 50MB each)</p>
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
                <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3 text-sm font-bold">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  {files.length} files selected
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="font-bold">Cancel</Button>
            <Button 
              type="submit" 
              disabled={isLoading || (type === 'photos' && !files)}
              className="font-bold px-8 shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Confirm & Save'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
