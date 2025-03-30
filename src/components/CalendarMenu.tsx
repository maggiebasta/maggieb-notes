import { useState } from 'react';
import { Calendar, Plus, FileText, RefreshCw } from 'lucide-react';
import { getRecentAndUpcomingEvents } from '../lib/googleCalendar';
import { Template } from '../types';

interface CalendarEvent {
  id: string;
  summary: string;
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

interface CalendarMenuProps {
  templates: Template[];
  onCreateFromCalendar: (event: CalendarEvent, template?: Template) => void;
}

export function CalendarMenu({ templates, onCreateFromCalendar }: CalendarMenuProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showTemplateOptions, setShowTemplateOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const fetchEvents = async () => {
    setLoading(true);
    const calendarEvents = await getRecentAndUpcomingEvents();
    setEvents(calendarEvents);
    setLoading(false);
  };
  
  const formatEventTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="relative group">
      {/* New note from calendar button */}
      <button 
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        onClick={() => {
          fetchEvents();
        }}
        onMouseEnter={fetchEvents}
      >
        <Calendar className="w-4 h-4" />
        New note from calendar
      </button>
      
      {/* Dropdown menu */}
      <div className="absolute top-full right-0 w-80">
        <div className="h-2" /> {/* Invisible bridge for hover state */}
        <div className="hidden group-hover:block bg-white rounded-lg shadow-lg border border-gray-200">
          {/* Header with refresh button */}
          <div className="flex justify-between items-center p-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Calendar Events</span>
            <button 
              onClick={fetchEvents}
              className="p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
              title="Refresh calendar events"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          {/* Show events or loading indicator */}
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Loading calendar events...
            </div>
          ) : events.length > 0 ? (
            <>
              {/* Meeting list */}
              <div className="max-h-60 overflow-y-auto">
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowTemplateOptions(true);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                  >
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <div className="font-medium truncate">{event.summary}</div>
                      <div className="text-xs text-gray-500">
                        {formatEventTime(event.start.dateTime)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No meetings found in the past hour or upcoming hour
            </div>
          )}
          
          {/* Template selection after event is selected */}
          {showTemplateOptions && selectedEvent && (
            <div className="border-t border-gray-200">
              <div className="p-3 bg-gray-50">
                <div className="font-medium">{selectedEvent.summary}</div>
                <div className="text-xs text-gray-500 mt-1">Select note type:</div>
              </div>
              
              {/* Blank note option */}
              <button
                onClick={() => onCreateFromCalendar(selectedEvent)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
              >
                <Plus className="w-4 h-4" />
                <span>Blank Note</span>
              </button>
              
              {/* Template options */}
              <div className="max-h-40 overflow-y-auto">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => onCreateFromCalendar(selectedEvent, template)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{template.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
