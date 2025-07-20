import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertEventSchema, type Event } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Event routes
  app.get("/api/events", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { startDate, endDate } = req.query;
      let events: Event[];

      if (startDate && endDate) {
        events = await storage.getUserEventsByDateRange(
          req.user!.id,
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        events = await storage.getUserEvents(req.user!.id);
      }

      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const validatedEvent = insertEventSchema.parse(req.body);
      const event = await storage.createEvent({
        ...validatedEvent,
        userId: req.user!.id,
      });
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const eventId = parseInt(req.params.id);
      const validatedEvent = insertEventSchema.partial().parse(req.body);
      
      const event = await storage.updateEvent(eventId, req.user!.id, validatedEvent);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const eventId = parseInt(req.params.id);
      const deleted = await storage.deleteEvent(eventId, req.user!.id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
