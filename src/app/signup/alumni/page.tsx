
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Alumni } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const ALUMNI_STORAGE_KEY = 'alumni-data';
const LOGGED_IN_USER_ID_KEY = 'alumni-user-id';

export default function AlumniSignUpPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const alumniList: Alumni[] = JSON.parse(localStorage.getItem(ALUMNI_STORAGE_KEY) || '[]');
            
            const existingUser = alumniList.find(a => a.email === email);
            if (existingUser) {
                toast({
                    title: "Sign-up Failed",
                    description: "An account with this email already exists. Please log in.",
                    variant: "destructive"
                });
                return;
            }

            const newId = `alumni-${Date.now()}`;
            const newUser: Alumni = {
                id: newId,
                name: name,
                email: email,
                // In a real app, you would hash the password. We are skipping that for this demo.
                graduationYear: new Date().getFullYear(),
                currentRole: 'Newly Joined',
                skills: [],
                linkedinURL: '',
                shortBio: 'Please update your bio.',
                avatarUrl: `https://api.dicebear.com/7.x/initials/json?seed=${name}`,
            };
            
            alumniList.unshift(newUser);
            localStorage.setItem(ALUMNI_STORAGE_KEY, JSON.stringify(alumniList));
            localStorage.setItem(LOGGED_IN_USER_ID_KEY, newId);
            
            toast({
                title: "Account Created!",
                description: "Welcome to AlumniLink! You are now logged in.",
            });
            router.push('/alumni-dashboard');

        } catch (error) {
            console.error("Could not handle sign-up:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred during sign-up.",
                variant: "destructive"
            });
        }
    }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      <Image
        src="https://picsum.photos/seed/302/1920/1080"
        alt="University graduation"
        fill
        className="object-cover opacity-20"
        data-ai-hint="university graduation"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
      <div className="relative z-10 flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="bg-primary p-2 rounded-lg">
            <LinkIcon className="text-primary-foreground h-6 w-6" />
          </div>
          <h1 className="text-3xl font-headline font-bold text-primary">
            AlumniLink
          </h1>
        </Link>
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Create Your Account</CardTitle>
            <CardDescription>Join the Alumni Network.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
               <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input type="text" id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" placeholder="alumni@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input type="password" id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Sign Up
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login/alumni" className="underline">
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
