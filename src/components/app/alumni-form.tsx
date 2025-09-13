
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wand2, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Alumni } from '@/lib/types';
import { enrichAlumniProfile } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const alumniSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  avatarUrl: z.string().optional().or(z.literal('')),
  graduationYear: z.coerce.number().min(1900).max(new Date().getFullYear() + 10),
  currentRole: z.string().min(1, 'Current role is required'),
  skills: z.string(),
  linkedinURL: z.string().url().optional().or(z.literal('')),
  shortBio: z.string(),
});

type AlumniFormProps = {
  alumni?: Alumni | null;
  onSave: (data: Alumni) => void;
  onCancel: () => void;
};

export function AlumniForm({ alumni, onSave, onCancel }: AlumniFormProps) {
  const { toast } = useToast();
  const [enrichState, enrichFormAction] = useActionState(enrichAlumniProfile, null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(alumni?.avatarUrl || null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isFormSubmitting },
    setValue,
    watch,
    trigger,
  } = useForm<z.infer<typeof alumniSchema>>({
    resolver: zodResolver(alumniSchema),
    defaultValues: {
      name: alumni?.name || '',
      email: alumni?.email || '',
      avatarUrl: alumni?.avatarUrl || '',
      graduationYear: alumni?.graduationYear || new Date().getFullYear(),
      currentRole: alumni?.currentRole || '',
      skills: alumni?.skills?.join(', ') || '',
      linkedinURL: alumni?.linkedinURL || '',
      shortBio: alumni?.shortBio || '',
    },
  });

  const linkedinUrlValue = watch('linkedinURL');

  useEffect(() => {
    if (enrichState?.message) {
      toast({
        title: enrichState.error ? 'Enrichment Failed' : 'Enrichment Success',
        description: enrichState.message,
        variant: enrichState.error ? 'destructive' : 'default',
      });
    }
    if (enrichState?.data) {
      const { name, education, skills, bio } = enrichState.data;
      if (name) setValue('name', name);
      if (bio) setValue('shortBio', bio);
      if (skills) setValue('skills', skills.join(', '));
    }
  }, [enrichState, setValue, toast]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setAvatarPreview(dataUrl);
        setValue('avatarUrl', dataUrl, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: z.infer<typeof alumniSchema>) => {
    onSave({
      ...alumni!,
      id: alumni?.id || `alumni-${Date.now()}`,
      ...data,
      skills: data.skills.split(',').map((s) => s.trim()).filter(Boolean),
      avatarUrl: data.avatarUrl || `https://picsum.photos/seed/${Date.now()}/200/200`,
    });
  };

  const handleEnrich = async () => {
    const isValid = await trigger('linkedinURL');
    if (isValid && linkedinUrlValue) {
      const formData = new FormData();
      formData.append('linkedinUrl', linkedinUrlValue);
      enrichFormAction(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </div>

       <div>
        <Label>Profile Photo</Label>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarPreview || undefined} alt="Profile preview" />
            <AvatarFallback>{alumni?.name.charAt(0) || 'A'}</AvatarFallback>
          </Avatar>
          <Input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          <Button type="button" variant="outline" onClick={() => document.getElementById('avatar-upload')?.click()}>
            <Upload className="mr-2" /> Upload Image
          </Button>
        </div>
        {errors.avatarUrl && <p className="text-sm text-destructive">{errors.avatarUrl.message}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <Label htmlFor="currentRole">Current Role</Label>
            <Input id="currentRole" {...register('currentRole')} />
            {errors.currentRole && <p className="text-sm text-destructive">{errors.currentRole.message}</p>}
        </div>
        <div>
            <Label htmlFor="graduationYear">Graduation Year</Label>
            <Input id="graduationYear" type="number" {...register('graduationYear')} />
            {errors.graduationYear && <p className="text-sm text-destructive">{errors.graduationYear.message}</p>}
        </div>
      </div>

       <Card>
            <CardHeader>
                <CardTitle className="text-lg font-headline">AI Profile Enrichment</CardTitle>
                <CardDescription>Enter a LinkedIn URL to automatically fill in profile details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex gap-2">
                    <div className="flex-grow">
                        <Label htmlFor="linkedinURL" className="sr-only">LinkedIn URL</Label>
                        <Input id="linkedinURL" placeholder="https://www.linkedin.com/in/..." {...register('linkedinURL')} />
                    </div>
                    <Button type="button" onClick={handleEnrich} disabled={isFormSubmitting} variant="outline">
                       <Wand2 className="mr-2 h-4 w-4" />
                        Enrich with AI
                    </Button>
                </div>
                 {errors.linkedinURL && <p className="text-sm text-destructive">{errors.linkedinURL.message}</p>}
            </CardContent>
       </Card>

      <div>
        <Label htmlFor="skills">Skills (comma-separated)</Label>
        <Input id="skills" {...register('skills')} placeholder="e.g., React, Product Management, UI/UX" />
        {errors.skills && <p className="text-sm text-destructive">{errors.skills.message}</p>}
      </div>

      <div>
        <Label htmlFor="shortBio">Short Bio</Label>
        <Textarea id="shortBio" {...register('shortBio')} rows={4} />
        {errors.shortBio && <p className="text-sm text-destructive">{errors.shortBio.message}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isFormSubmitting}>
          {isFormSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {alumni ? 'Save Changes' : 'Add Alumni'}
        </Button>
      </div>
    </form>
  );
}
