import React, { useState } from 'react';
import { LogIn, LogOut, Image as ImageIcon, Shield, Search, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/types';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onGoHome: () => void;
  onSearch?: (query: string) => void;
}

export function Navbar({ user, onLogin, onLogout, onGoHome, onSearch }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
        {/* Logo & Main Nav */}
        <div className="flex items-center gap-8">
          <div 
            className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
            onClick={onGoHome}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <ImageIcon className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tighter font-heading">CECYDAR</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={onGoHome}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </button>
            <button 
              onClick={onGoHome} // For now, home shows albums
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Albums
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search albums or photos..."
              className="h-9 w-full bg-secondary/50 pl-10 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearch?.(e.target.value);
              }}
            />
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden flex-col items-end sm:flex">
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  {user.isAdmin && <Shield className="h-3 w-3" />}
                  {user.isAdmin ? 'ADMIN' : user.isContributor ? 'CONTRIBUTOR' : 'MEMBER'}
                </span>
                <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{user.email}</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground border">
                <UserIcon className="h-4 w-4" />
              </div>
              <Button variant="ghost" size="icon" onClick={onLogout} title="Logout" className="h-8 w-8">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onLogin} className="font-semibold">
                Log In
              </Button>
              <Button size="sm" onClick={onLogin} className="font-semibold px-6">
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
