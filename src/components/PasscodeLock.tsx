import React, { useState } from 'react';
import { Lock, Unlock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

interface PasscodeLockProps {
  correctPasscode: string;
  onUnlock: () => void;
  title: string;
}

export function PasscodeLock({ correctPasscode, onUnlock, title }: PasscodeLockProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === correctPasscode) {
      onUnlock();
    } else {
      setError(true);
      setPasscode('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-sm w-full space-y-8 rounded-3xl bg-secondary/10 p-10 backdrop-blur-sm border border-secondary/20"
      >
        <div className="flex flex-col items-center gap-4">
          <div className={`rounded-full p-4 transition-colors ${error ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
            {error ? <AlertCircle className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">Protected Album</h3>
            <p className="text-sm text-muted-foreground">
              Enter the passcode to view <span className="font-semibold text-foreground">"{title}"</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className={`text-center text-lg tracking-[0.5em] h-12 ${error ? 'border-destructive ring-destructive' : ''}`}
              autoFocus
            />
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs font-medium text-destructive"
                >
                  Incorrect passcode. Please try again.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <Button type="submit" className="w-full h-12 font-bold text-lg">
            Unlock Album
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
