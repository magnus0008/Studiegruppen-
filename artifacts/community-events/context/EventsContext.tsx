import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type EventCategory = "social" | "fitness" | "food" | "study" | "entertainment" | "other";

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  location: string;
  totalSpots: number;
  signedUpUserIds: string[];
  signUpDeadline: string;
  createdBy: string;
  createdAt: string;
}

interface EventsContextValue {
  events: Event[];
  currentUserId: string;
  addEvent: (event: Omit<Event, "id" | "signedUpUserIds" | "createdAt" | "createdBy">) => void;
  joinEvent: (eventId: string) => void;
  leaveEvent: (eventId: string) => void;
  isJoined: (eventId: string) => boolean;
  isFull: (event: Event) => boolean;
  isPastDeadline: (event: Event) => boolean;
  getMyEvents: () => Event[];
}

const EventsContext = createContext<EventsContextValue | null>(null);

const STORAGE_KEY = "@community_events";
const USER_ID_KEY = "@current_user_id";

const SAMPLE_EVENTS: Event[] = [
  {
    id: "1",
    title: "Movie Night: Dune Part 2",
    description: "Join us for an epic movie night in the common room! Popcorn and drinks will be provided. Bring a blanket if you like!",
    category: "entertainment",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Common Room B, Floor 3",
    totalSpots: 20,
    signedUpUserIds: ["user2", "user3", "user4", "user5", "user6"],
    signUpDeadline: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "user2",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    title: "Sunday Communal Dinner",
    description: "Let's cook together! This week's menu: pasta, salad, and garlic bread. Everyone brings one ingredient.",
    category: "food",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Shared Kitchen, Floor 1",
    totalSpots: 12,
    signedUpUserIds: ["user2", "user3", "user4", "user5", "user6", "user7", "user8", "user9", "user10", "user11", "user12"],
    signUpDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "user3",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Morning Run — Riverside Loop",
    description: "Easy 5K run along the riverside trail. All paces welcome! We'll meet at the front entrance.",
    category: "fitness",
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Front Entrance",
    totalSpots: 10,
    signedUpUserIds: ["user2", "user3"],
    signUpDeadline: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    createdBy: "user4",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    title: "Study Group: Linear Algebra",
    description: "Weekly study session for anyone taking LA courses. We'll work through problem sets together.",
    category: "study",
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Study Room 2A",
    totalSpots: 8,
    signedUpUserIds: ["user2", "user5", "user6"],
    signUpDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "user5",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    title: "Board Game Night",
    description: "Bring your favorite board games! We have Catan, Ticket to Ride, and Codenames ready to go.",
    category: "social",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Lounge, Floor 2",
    totalSpots: 16,
    signedUpUserIds: ["user2"],
    signUpDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "user6",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("user1");

  useEffect(() => {
    async function load() {
      try {
        const [storedUserId, storedEvents] = await Promise.all([
          AsyncStorage.getItem(USER_ID_KEY),
          AsyncStorage.getItem(STORAGE_KEY),
        ]);

        if (storedUserId) {
          setCurrentUserId(storedUserId);
        } else {
          const newId = "user" + generateId();
          await AsyncStorage.setItem(USER_ID_KEY, newId);
          setCurrentUserId(newId);
        }

        if (storedEvents) {
          setEvents(JSON.parse(storedEvents));
        } else {
          setEvents(SAMPLE_EVENTS);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_EVENTS));
        }
      } catch {
        setEvents(SAMPLE_EVENTS);
      }
    }
    load();
  }, []);

  const persist = useCallback(async (updated: Event[]) => {
    setEvents(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }, []);

  const addEvent = useCallback((eventData: Omit<Event, "id" | "signedUpUserIds" | "createdAt" | "createdBy">) => {
    const newEvent: Event = {
      ...eventData,
      id: generateId(),
      signedUpUserIds: [],
      createdBy: currentUserId,
      createdAt: new Date().toISOString(),
    };
    setEvents(prev => {
      const updated = [newEvent, ...prev];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, [currentUserId]);

  const joinEvent = useCallback((eventId: string) => {
    setEvents(prev => {
      const updated = prev.map(e => {
        if (e.id === eventId && !e.signedUpUserIds.includes(currentUserId) && e.signedUpUserIds.length < e.totalSpots) {
          return { ...e, signedUpUserIds: [...e.signedUpUserIds, currentUserId] };
        }
        return e;
      });
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, [currentUserId]);

  const leaveEvent = useCallback((eventId: string) => {
    setEvents(prev => {
      const updated = prev.map(e => {
        if (e.id === eventId) {
          return { ...e, signedUpUserIds: e.signedUpUserIds.filter(id => id !== currentUserId) };
        }
        return e;
      });
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, [currentUserId]);

  const isJoined = useCallback((eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.signedUpUserIds.includes(currentUserId) : false;
  }, [events, currentUserId]);

  const isFull = useCallback((event: Event) => {
    return event.signedUpUserIds.length >= event.totalSpots;
  }, []);

  const isPastDeadline = useCallback((event: Event) => {
    return new Date(event.signUpDeadline) < new Date();
  }, []);

  const getMyEvents = useCallback(() => {
    return events.filter(e => e.signedUpUserIds.includes(currentUserId));
  }, [events, currentUserId]);

  return (
    <EventsContext.Provider value={{ events, currentUserId, addEvent, joinEvent, leaveEvent, isJoined, isFull, isPastDeadline, getMyEvents }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents must be used within EventsProvider");
  return ctx;
}
