
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Handshake, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { findMentorsAction } from '@/lib/actions';
import { MentorCard } from '@/components/app/mentor-card';
import type { Alumni } from '@/lib/types';

const ALUMNI_STORAGE_KEY = 'alumni-data';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Finding Mentors...
        </>
      ) : (
        <>
          <Handshake className="mr-2 h-4 w-4" /> Find Mentors
        </>
      )}
    </Button>
  );
}

export default function MentorMatchingPage() {
  const [state, formAction] = useActionState(findMentorsAction, null);
  const { pending } = useFormStatus();

  useEffect(() => {
    // When new mentors are found, add them to our main alumni list if they don't already exist.
    if (state?.data) {
      try {
        const storedAlumni = localStorage.getItem(ALUMNI_STORAGE_KEY);
        const alumniList: Alumni[] = storedAlumni ? JSON.parse(storedAlumni) : [];
        const newMentors = state.data.filter(
          (mentor: Alumni) => !alumniList.some((alumnus) => alumnus.id === mentor.id)
        );

        if (newMentors.length > 0) {
          const updatedList = [...newMentors, ...alumniList];
          localStorage.setItem(ALUMNI_STORAGE_KEY, JSON.stringify(updatedList));
        }
      } catch (error) {
        console.error("Failed to update alumni list with new mentors:", error);
      }
    }
  }, [state]);


  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Find Your Mentor</CardTitle>
            <CardDescription>
              Describe your skills, interests, and what you&apos;re looking for in a mentor to get matched.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div>
                <Label htmlFor="skillsAndInterests">Your Skills & Interests</Label>
                <Textarea
                  id="skillsAndInterests"
                  name="skillsAndInterests"
                  placeholder="e.g., 'I am a junior software developer interested in learning more about cloud computing, specifically AWS and serverless architectures. I'm also keen on product management.'"
                  rows={6}
                  required
                />
                {state?.error?.skillsAndInterests && (
                  <p className="text-sm text-destructive mt-1">{state.error.skillsAndInterests[0]}</p>
                )}
              </div>
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2 space-y-6">
        <h2 className="text-2xl font-headline font-bold">Top Mentor Matches</h2>
        
        {!state?.data && !pending && (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                Your mentor matches will appear here.
            </div>
        )}

        {pending && (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg flex items-start gap-4 animate-pulse">
                        <div className="w-20 h-20 rounded-full bg-muted"></div>
                        <div className="flex-grow space-y-2">
                            <div className="h-5 w-1/2 bg-muted rounded"></div>
                            <div className="h-4 w-3/4 bg-muted rounded"></div>
                            <div className="h-8 w-full bg-muted rounded mt-4"></div>
                        </div>
                    </div>
                ))}
            </div>
        )}
        
        {state?.data && state.data.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {state.data.map((mentor: Alumni) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        )}
        
        {state?.data && state.data.length === 0 && (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                No mentors found. Try refining your search.
            </div>
        )}

        {state?.error && typeof state.error === 'string' && (
            <div className="text-center text-destructive p-8 border-2 border-dashed border-destructive/50 rounded-lg">
                {state.message} Please try again later.
            </div>
        )}
      </div>
    </div>
  );
}
