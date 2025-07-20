import { useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Plus, User, LogOut } from "lucide-react";
import DailyView from "../components/calendar/daily-view";
import WeeklyView from "../components/calendar/weekly-view";
import MonthlyView from "../components/calendar/monthly-view";
import EventModal from "../components/event-modal";
import { useAuth } from "../hooks/use-auth";

type ViewMode = "daily" | "weekly" | "monthly";

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case "daily":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        break;
      case "weekly":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "monthly":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getDateDisplayText = () => {
    switch (viewMode) {
      case "daily":
        return format(currentDate, "EEEE, MMMM d, yyyy");
      case "weekly":
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      case "monthly":
        return format(currentDate, "MMMM yyyy");
      default:
        return "";
    }
  };

  const renderCalendarView = () => {
    switch (viewMode) {
      case "daily":
        return <DailyView currentDate={currentDate} />;
      case "weekly":
        return <WeeklyView currentDate={currentDate} />;
      case "monthly":
        return <MonthlyView currentDate={currentDate} />;
      default:
        return <MonthlyView currentDate={currentDate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Calendar</h1>
                <p className="text-xs text-gray-500">Personal Scheduler</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.username}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDate("prev")}
                className="rounded-r-none border-r"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 py-2 text-sm font-medium text-gray-900 min-w-[200px] text-center">
                {getDateDisplayText()}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDate("next")}
                className="rounded-l-none border-l"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="whitespace-nowrap"
            >
              Today
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {(["daily", "weekly", "monthly"] as ViewMode[]).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="capitalize"
              >
                {mode}
              </Button>
            ))}
          </div>

          <div className="lg:ml-auto">
            <Button onClick={() => setIsEventModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {renderCalendarView()}
        </div>
      </div>

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        selectedDate={currentDate}
      />
    </div>
  );
}