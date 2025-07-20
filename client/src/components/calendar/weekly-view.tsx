import { useQuery } from "@tanstack/react-query";
import { type Event } from "@shared/schema";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addHours } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface WeeklyViewProps {
  currentDate: Date;
}

const eventTypeColors: Record<string, string> = {
  meeting: "bg-blue-100 border-blue-500 text-blue-900",
  personal: "bg-purple-100 border-purple-500 text-purple-900",
  work: "bg-amber-100 border-amber-500 text-amber-900",
  health: "bg-green-100 border-green-500 text-green-900",
  other: "bg-red-100 border-red-500 text-red-900",
};

export default function WeeklyView({ currentDate }: WeeklyViewProps) {
  const startDate = startOfWeek(currentDate);
  const endDate = endOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: startDate, end: endDate });

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events", startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
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
    
    // Sort events by start time for proper display order
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
      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="p-4 text-center border-l border-gray-200 first:border-l-0">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {format(day, "EEE")}
            </div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {weekDays.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[500px] border-l border-gray-200 first:border-l-0 p-3 ${
                isToday ? 'bg-blue-50' : 'hover:bg-gray-25'
              } transition-colors`}
            >
              <div className="space-y-2">
                {dayEvents.map((event) => {
                  const colorClass = eventTypeColors[event.type] || eventTypeColors.other;
                  
                  return (
                    <div
                      key={event.id}
                      className={`rounded-md p-3 border-l-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${colorClass}`}
                      title={`${event.title}\n${format(new Date(event.startTime), "h:mm a")} - ${format(new Date(event.endTime), "h:mm a")}${event.location ? `\n📍 ${event.location}` : ''}\n📅 ${event.type}`}
                    >
                      <div className="font-semibold text-sm mb-1">{event.title}</div>
                      <div className="text-xs font-medium">
                        {format(new Date(event.startTime), "h:mm a")} - {format(new Date(event.endTime), "h:mm a")}
                      </div>
                      {event.location && (
                        <div className="text-xs opacity-75 mt-1">📍 {event.location}</div>
                      )}
                      <div className="text-xs opacity-60 uppercase tracking-wide mt-1">
                        {event.type}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
