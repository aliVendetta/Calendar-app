import { useQuery } from "@tanstack/react-query";
import { type Event } from "@shared/schema";
import { format, startOfDay, endOfDay, addHours } from "date-fns";
import { Skeleton } from "../../components/ui/skeleton";

interface DailyViewProps {
  currentDate: Date;
}

const eventTypeColors: Record<string, string> = {
  meeting: "bg-blue-100 border-blue-500 text-blue-900",
  personal: "bg-purple-100 border-purple-500 text-purple-900",
  work: "bg-amber-100 border-amber-500 text-amber-900",
  health: "bg-green-100 border-green-500 text-green-900",
  other: "bg-red-100 border-red-500 text-red-900",
};

export default function DailyView({ currentDate }: DailyViewProps) {
  const startDate = startOfDay(currentDate);
  const endDate = endOfDay(currentDate);

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

  const dayEvents = events || [];
  


  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Group events by time for better display, supporting multiple events per hour
  const groupedEvents = dayEvents.reduce((acc, event) => {
    const hour = new Date(event.startTime).getHours();
    const timeSlot = format(new Date().setHours(hour), "h a");
    
    if (!acc[timeSlot]) {
      acc[timeSlot] = [];
    }
    acc[timeSlot].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  // Sort events within each time slot by start time
  Object.keys(groupedEvents).forEach(timeSlot => {
    groupedEvents[timeSlot].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Day Header */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {format(currentDate, "EEEE")}
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {format(currentDate, "MMMM d, yyyy")}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="p-6">
        {dayEvents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📅</div>
            <div className="text-lg font-medium">No events scheduled</div>
            <div className="text-sm">Enjoy your free day!</div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEvents).map(([timeSlot, events]) => (
              <div key={timeSlot} className="flex gap-6">
                <div className="w-20 flex-shrink-0">
                  <div className="text-lg font-semibold text-gray-900 sticky top-6">
                    {timeSlot}
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  {events.map((event) => {
                    const colorClass = eventTypeColors[event.type] || eventTypeColors.other;
                    
                    return (
                      <div
                        key={event.id}
                        className={`rounded-lg p-4 border-l-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${colorClass}`}
                        title={`${event.title}\n${format(new Date(event.startTime), "h:mm a")} - ${format(new Date(event.endTime), "h:mm a")}${event.location ? `\n📍 ${event.location}` : ''}\n📅 ${event.type}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-semibold text-lg">{event.title}</div>
                          <div className="text-xs font-medium uppercase tracking-wide opacity-60">
                            {event.type}
                          </div>
                        </div>
                        <div className="text-sm font-medium mb-2">
                          {format(new Date(event.startTime), "h:mm a")} - {format(new Date(event.endTime), "h:mm a")}
                        </div>
                        {event.location && (
                          <div className="text-sm opacity-75">📍 {event.location}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
