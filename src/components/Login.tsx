import React, { useState } from 'react';
import { Mail, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: (email: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
      onLogin(email);
      setIsLoading(false);
    }, 800);
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
                Enter your email to access the CECYDAR photo platform
              </CardDescription>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pb-8">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button 
                className="h-12 w-full text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </CardContent>
          </form>
          <CardFooter className="flex flex-col gap-4 bg-muted/30 py-6 text-center">
            <p className="text-xs text-muted-foreground">
              Admin: niyonzimaemmanuel85@gmail.com
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
