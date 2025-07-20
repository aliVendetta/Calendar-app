import { useQuery } from "@tanstack/react-query";
import { type Event } from "@shared/schema";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface MonthlyViewProps {
  currentDate: Date;
}

const eventTypeColors: Record<string, string> = {
  meeting: "bg-blue-500 text-white",
  personal: "bg-purple-500 text-white",
  work: "bg-amber-500 text-white",
  health: "bg-green-500 text-white",
  other: "bg-red-500 text-white",
};

export default function MonthlyView({ currentDate }: MonthlyViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events", calendarStart.toISOString(), calendarEnd.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: calendarStart.toISOString(),
        endDate: calendarEnd.toISOString(),
      });
      const response = await fetch(`/api/events?${params}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return response.json();
    },
  });

  const getEventsForDay = (day: Date) => {
    if (!events) return [];
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === day.toDateString();
    });
    
    // Sort events by start time for consistent display
    return dayEvents.sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  };



  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Days of week header */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-4 text-center border-l border-gray-200 first:border-l-0">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {day}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[140px] border-b border-l border-gray-200 first:border-l-0 p-2 ${
                !isCurrentMonth ? 'bg-gray-50' : 'hover:bg-gray-25'
              } transition-colors`}
            >
              <div className={`text-sm font-medium mb-2 ${
                isToday 
                  ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center' 
                  : isCurrentMonth 
                    ? 'text-gray-900' 
                    : 'text-gray-400'
              }`}>
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => {
                  const colorClass = eventTypeColors[event.type] || eventTypeColors.other;
                  
                  return (
                    <div
                      key={event.id}
                      className={`text-xs rounded-md px-2 py-2 font-medium shadow-sm ${colorClass} cursor-pointer hover:shadow-md transition-shadow`}
                      title={`${event.title}\n${format(new Date(event.startTime), "h:mm a")} - ${format(new Date(event.endTime), "h:mm a")}${event.location ? `\n📍 ${event.location}` : ''}`}
                    >
                      <div className="font-semibold truncate text-xs">{event.title}</div>
                      <div className="opacity-90 text-[10px] mt-1">
                        {format(new Date(event.startTime), "h:mm a")}
                      </div>
                    </div>
                  );
                })}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-md">
                    +{dayEvents.length - 2} more events
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
