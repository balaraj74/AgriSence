
"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useToast } from "@/hooks/use-toast";
import { AgrisenceLogo } from '@/components/agrisence-logo';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import Loading from './(app)/loading';

const GoogleIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2">
    <title>Google</title>
    <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.9 2.04-5.07 2.04-3.83 0-6.97-3.14-6.97-7s3.14-7 6.97-7c2.2 0 3.58.88 4.43 1.69l2.5-2.5C18.17 2.09 15.63 1 12.48 1 7.23 1 3.06 4.9 3.06 10s4.17 9 9.42 9c2.8 0 5.2-1 6.9-2.83 1.79-1.83 2.34-4.59 2.34-6.57 0-.54-.05-.98-.12-1.4z"/>
  </svg>
);

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isAuthLoading, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        if (authMode === 'signup') {
            if (!name) {
                toast({ variant: 'destructive', title: 'Name is required for sign up.'});
                setIsLoading(false);
                return;
            }
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            toast({ title: 'Sign up successful!', description: 'Welcome to AgriSence.' });
        } else {
            await signInWithEmailAndPassword(auth, email, password);
            toast({ title: 'Sign in successful!', description: 'Welcome back.' });
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: error.message.replace('Firebase: ', ''),
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Google Sign-In Error',
        description: error.code ? error.code.replace('auth/', '').replace(/-/g, ' ') : 'An unknown error occurred.',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (isAuthLoading || user) {
    return <Loading />;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-dvh p-4 bg-transparent">
        <div className="w-full max-w-sm space-y-4">
            <Card className="rounded-3xl">
               <CardHeader className="text-center">
                 <div className="w-24 h-24 mx-auto">
                    <AgrisenceLogo />
                 </div>
                 <CardTitle className="text-3xl font-bold tracking-tight pt-2">AgriSence</CardTitle>
                 <CardDescription>
                    Your AI-Powered Farming Assistant
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <form onSubmit={handleEmailAuth} className="w-full text-left space-y-4">
                    {authMode === 'signup' && (
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" type="text" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} required disabled={isLoading} />
                        </div>
                    )}
                     <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} minLength={6}/>
                    </div>
                    <Button type="submit" className="w-full gradient-button" disabled={isLoading}>
                        {isLoading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            authMode === 'signin' ? 'Sign In' : 'Create Account'
                        )}
                    </Button>
                </form>

                <div className="relative w-full my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">OR CONTINUE WITH</span>
                    </div>
                </div>

                 <Button
                    onClick={handleGoogleSignIn}
                    variant="outline"
                    className="w-full"
                    disabled={isGoogleLoading || isLoading}
                >
                    {isGoogleLoading ? (
                      <>
                        <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <GoogleIcon />
                        Continue with Google
                      </>
                    )}
                </Button>
               </CardContent>
            </Card>

            <Card className="rounded-3xl">
                <CardFooter className="justify-center p-4">
                     <p className="text-sm text-muted-foreground">
                        {authMode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                        <Button variant="link" className="px-1 text-accent" onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}>
                            {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
                        </Button>
                    </p>
               </CardFooter>
            </Card>
        </div>
    </main>
  );
}
