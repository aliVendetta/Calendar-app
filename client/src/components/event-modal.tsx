import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { insertEventSchema, type InsertEvent } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

export default function EventModal({ isOpen, onClose, selectedDate }: EventModalProps) {
  const { toast } = useToast();
  
  // Initialize with proper dates based on selected date
  const getInitialStartTime = () => {
    const start = new Date(selectedDate);
    start.setHours(9, 0, 0, 0); // Default to 9 AM
    return start;
  };
  
  const getInitialEndTime = () => {
    const end = new Date(selectedDate);
    end.setHours(10, 0, 0, 0); // Default to 10 AM (1 hour duration)
    return end;
  };
  
  const [formData, setFormData] = useState<Partial<InsertEvent>>({
    title: "",
    startTime: getInitialStartTime(),
    endTime: getInitialEndTime(),
    location: "",
    type: "other",
  });

  // Reset form when modal opens or selected date changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        startTime: getInitialStartTime(),
        endTime: getInitialEndTime(),
        location: "",
        type: "other",
      });
    }
  }, [isOpen, selectedDate]);

  const createEventMutation = useMutation({
    mutationFn: async (event: InsertEvent) => {
      const res = await apiRequest("POST", "/api/events", event);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Event created",
        description: "Your event has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      onClose();
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      startTime: getInitialStartTime(),
      endTime: getInitialEndTime(),
      location: "",
      type: "other",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Ensure we have valid data before validating
      const eventData = {
        ...formData,
        title: formData.title || "",
        startTime: formData.startTime || getInitialStartTime(),
        endTime: formData.endTime || getInitialEndTime(),
        type: formData.type || "other",
      };
      
      const validatedEvent = insertEventSchema.parse(eventData);
      createEventMutation.mutate(validatedEvent);
    } catch (error) {
      console.error("Validation error:", error);
      toast({
        title: "Invalid form data",
        description: "Please check all fields and try again.",
        variant: "destructive",
      });
    }
  };

  const formatDateTimeLocal = (date: Date) => {
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Create a new event for {format(selectedDate, "MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              type="text"
              value={formData.title || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime ? formatDateTimeLocal(formData.startTime) : ""}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  startTime: new Date(e.target.value) 
                }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime ? formatDateTimeLocal(formData.endTime) : ""}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  endTime: new Date(e.target.value) 
                }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="type">Event Type</Label>
            <Select
              value={formData.type || "other"}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              type="text"
              value={formData.location || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Enter location"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={createEventMutation.isPending}
            >
              {createEventMutation.isPending ? "Creating..." : "Create Event"}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
