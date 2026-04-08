import React, { useState } from 'react';
import { LogIn, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await onLogin();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden border-none shadow-2xl">
          <div className="h-2 bg-primary" />
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <ImageIcon className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <CardTitle className="font-heading text-4xl font-bold tracking-tight">CECYDAR</CardTitle>
              <CardDescription className="text-base">
                Join our community to view and download organization photos
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pb-8">
            <Button 
              className="h-12 w-full text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]" 
              onClick={handleGoogleLogin} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Continue with Google
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 bg-muted/30 py-6 text-center">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our terms of service and privacy policy.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
