import { users, events, type User, type InsertUser, type Event, type InsertEvent } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";
import session, { Store } from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createEvent(event: InsertEvent & { userId: number }): Promise<Event>;
  getUserEvents(userId: number): Promise<Event[]>;
  getUserEventsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Event[]>;
  getEvent(eventId: number, userId: number): Promise<Event | undefined>;
  updateEvent(eventId: number, userId: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(eventId: number, userId: number): Promise<boolean>;
  
  sessionStore: Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createEvent(event: InsertEvent & { userId: number }): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values(event)
      .returning();
    return newEvent;
  }

  async getUserEvents(userId: number): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.userId, userId));
  }

  async getUserEventsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.userId, userId),
          gte(events.startTime, startDate),
          lte(events.startTime, endDate)
        )
      );
  }

  async getEvent(eventId: number, userId: number): Promise<Event | undefined> {
    const [event] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, eventId), eq(events.userId, userId)));
    return event || undefined;
  }

  async updateEvent(eventId: number, userId: number, event: Partial<InsertEvent>): Promise<Event | undefined> {
    const [updatedEvent] = await db
      .update(events)
      .set(event)
      .where(and(eq(events.id, eventId), eq(events.userId, userId)))
      .returning();
    return updatedEvent || undefined;
  }

  async deleteEvent(eventId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(events)
      .where(and(eq(events.id, eventId), eq(events.userId, userId)));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
