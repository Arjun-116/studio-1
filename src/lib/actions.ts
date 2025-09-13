
'use server';

import { generateEventInvitation } from '@/ai/flows/generate-event-invitation';
import { findPotentialMentors } from '@/ai/flows/mentor-matching';
import { enrichProfile } from '@/ai/flows/profile-enrichment';
import { z } from 'zod';
import type { Alumni } from './types';

const enrichProfileSchema = z.object({
  linkedinUrl: z.string().url({ message: "Please enter a valid LinkedIn URL." }),
});

export async function enrichAlumniProfile(prevState: any, formData: FormData) {
  const validatedFields = enrichProfileSchema.safeParse({
    linkedinUrl: formData.get('linkedinUrl'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid LinkedIn URL.',
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const enrichedData = await enrichProfile(validatedFields.data);
    return {
      message: 'Profile enriched successfully.',
      data: enrichedData,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'An error occurred during profile enrichment.',
      error: 'AI service failed.',
    };
  }
}

const findMentorsSchema = z.object({
    skillsAndInterests: z.string().min(10, { message: "Please describe your skills and interests." }),
});

export async function findMentorsAction(prevState: any, formData: FormData) {
    const validatedFields = findMentorsSchema.safeParse({
        skillsAndInterests: formData.get('skillsAndInterests'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Invalid input.',
            error: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    try {
        const result = await findPotentialMentors({ 
            studentSkillsAndInterests: validatedFields.data.skillsAndInterests,
        });

        const mentorsWithDetails: Alumni[] = result.mentorMatches.map((mentor, index) => ({
            ...mentor,
            id: mentor.id || `mentor-${Date.now() + index}`,
        }));

        return {
            message: 'Mentors found successfully.',
            data: mentorsWithDetails,
            // We are not saving to local storage here anymore, the frontend will handle it if needed.
        };
    } catch (error) {
        console.error(error);
        return {
            message: 'An error occurred while finding mentors.',
            error: 'AI service failed.',
        };
    }
}


const generateInvitationSchema = z.object({
    eventDetails: z.string().min(10, { message: "Please provide some event details." }),
});

export async function generateInvitationAction(prevState: any, formData: FormData) {
    const validatedFields = generateInvitationSchema.safeParse({
        eventDetails: formData.get('eventDetails'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Invalid input.',
            error: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const result = await generateEventInvitation({ eventDetails: validatedFields.data.eventDetails });
        return {
            message: 'Invitation generated successfully.',
            data: result,
        };
    } catch (error) {
        console.error(error);
        return {
            message: 'An error occurred while generating the invitation.',
            error: 'AI service failed.',
        };
    }
}
