import { supabase } from './supabase';

export interface CalendarEvent {
  id: string;
  summary: string; // Title of the event
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
}

export async function getRecentAndUpcomingEvents(): Promise<CalendarEvent[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];
    
    const provider = session.user?.app_metadata?.provider;
    if (provider !== 'google') return [];
    
    const { provider_token } = session;
    if (!provider_token) return [];
    
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    
    const timeMin = oneHourAgo.toISOString();
    const timeMax = oneHourLater.toISOString();
    
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${provider_token}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }
    
    const data = await response.json();
    return data.items as CalendarEvent[];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

export function formatAttendees(attendees?: Array<{ email: string; displayName?: string; }>): string {
  if (!attendees || attendees.length === 0) return "No attendees";
  
  return attendees
    .map(a => a.displayName || a.email)
    .join(", ");
}
