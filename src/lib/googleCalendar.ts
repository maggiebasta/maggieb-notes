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
    if (!session) {
      console.log('No session found');
      return [];
    }
    
    const provider = session.user?.app_metadata?.provider;
    if (provider !== 'google') {
      console.log('Not using Google provider:', provider);
      return [];
    }
    
    const { provider_token } = session;
    if (!provider_token) {
      console.log('No provider token found');
      return [];
    }
    
    const now = new Date();
    console.log('Current time:', now.toLocaleString());
    
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    const timeMin = startOfDay.toISOString();
    const timeMax = endOfDay.toISOString();
    
    console.log('Fetching events from', startOfDay.toLocaleString(), 'to', endOfDay.toLocaleString());
    
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${provider_token}`,
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`Failed to fetch calendar events: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Events found:', data.items?.length || 0);
    
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    const filteredEvents = data.items?.filter((event: CalendarEvent) => {
      const eventStart = new Date(event.start.dateTime);
      return eventStart >= twoHoursAgo && eventStart <= twoHoursLater;
    }) || [];
    
    console.log('Filtered events within time range:', filteredEvents.length);
    return filteredEvents as CalendarEvent[];
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
