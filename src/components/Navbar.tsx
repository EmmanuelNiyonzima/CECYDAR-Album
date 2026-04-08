import React from 'react';
import { LogIn, LogOut, Image as ImageIcon, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/types';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onGoHome: () => void;
}

export function Navbar({ user, onLogin, onLogout, onGoHome }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div 
          className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
          onClick={onGoHome}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">CECYDAR</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Photo Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden flex-col items-end sm:flex">
                <span className="text-sm font-medium">{user.email}</span>
                {user.isAdmin && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-primary">
                    <Shield className="h-3 w-3" />
                    Admin
                  </span>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={onLogout} title="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button onClick={onLogin} className="gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
