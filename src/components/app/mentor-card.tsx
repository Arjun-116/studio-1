import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Alumni } from '@/lib/types';
import { Linkedin, MessageSquare } from 'lucide-react';

type MentorCardProps = {
  mentor: Alumni;
};

export function MentorCard({ mentor }: MentorCardProps) {
  const matchScore = mentor.matchScore || 0;
  let scoreColor = 'bg-red-500';
  if (matchScore > 70) scoreColor = 'bg-green-500';
  else if (matchScore > 40) scoreColor = 'bg-yellow-500';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Image
            src={mentor.avatarUrl}
            alt={mentor.name}
            width={80}
            height={80}
            className="rounded-full border-2 border-primary/20 object-cover"
            data-ai-hint="person portrait"
          />
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold font-headline">{mentor.name}</h3>
                <p className="text-sm text-muted-foreground">{mentor.currentRole}</p>
              </div>
              <div className="flex items-center">
                 <Button variant="ghost" size="icon" asChild>
                    <Link href={`/alumni-dashboard/messaging?recipientId=${mentor.id}`}>
                      <MessageSquare className="h-5 w-5 text-muted-foreground hover:text-primary" />
                    </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                    <a href={mentor.linkedinURL} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary" />
                    </a>
                </Button>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                 <span className="text-xs font-medium text-muted-foreground">Match Score</span>
                 <span className="text-xs font-semibold text-primary">{matchScore}%</span>
              </div>
              <Progress value={matchScore} className="h-2" />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">{mentor.shortBio}</p>
        </div>
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-semibold mb-2">Top Skills</h4>
          <div className="flex flex-wrap gap-2">
            {mentor.skills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
