import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';

export type OutfitItem = {
    label: string;
    image: any;
};

export type EventCard = {
    id: string;
    title: string;
    dateLine: string;
    time: string;
    outfit: OutfitItem[];
};

interface EventsState {
    events: EventCard[];
    addEvent: (event: Omit<EventCard, 'id'>) => void;
    updateEvent: (id: string, updates: Partial<EventCard>) => void;
    deleteEvent: (id: string) => void;
    setEvents: (events: EventCard[]) => void;
}

const INITIAL_EVENTS: EventCard[] = [
    {
        id: "1",
        title: "Office Meeting",
        dateLine: "Fri, Aug 8",
        time: "10.20 PM",
        outfit: [
            { label: "Blue Shirt", image: require("../../assets/images/shirt.png") },
            { label: "Casual Shoe", image: require("../../assets/images/shoe.png") },
        ],
    },
    {
        id: "2",
        title: "Weekend Party",
        dateLine: "Sat, Aug 9",
        time: "08:00 PM",
        outfit: [
            { label: "White Polo", image: { uri: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=400&q=80" } },
            { label: "Sneakers", image: { uri: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80" } },
        ],
    },
];

export const useEventsStore = create<EventsState>()(
    persist(
        (set) => ({
            events: INITIAL_EVENTS,
            addEvent: (event) => set((state) => ({
                events: [{ ...event, id: String(Date.now()) }, ...state.events]
            })),
            updateEvent: (id, updates) => set((state) => ({
                events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e))
            })),
            deleteEvent: (id) => set((state) => ({
                events: state.events.filter((e) => e.id !== id)
            })),
            setEvents: (events) => set({ events }),
        }),
        {
            name: 'events-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
