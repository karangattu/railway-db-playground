"use client";

import { useState, useEffect } from "react";
import { LogOut, LogIn } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { CreateEventForm } from "@/components/CreateEventForm";
import type { Event } from "@/lib/db/schema";

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Initialize user session
  useEffect(() => {
    const initializeUser = async () => {
      let storedUserId = localStorage.getItem("userId");
      const storedIsAdmin = localStorage.getItem("isAdmin") === "true";

      if (!storedUserId) {
        // Generate a new user ID for this session
        storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("userId", storedUserId);
        localStorage.setItem("isAdmin", "false");
      }

      // Register user in database
      try {
        await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: storedUserId,
            email: `${storedUserId}@example.com`,
            name: "User",
            isAdmin: storedIsAdmin,
          }),
        });
      } catch (err) {
        console.error("Failed to register user:", err);
      }

      setUserId(storedUserId);
      setIsAdmin(storedIsAdmin);
    };

    initializeUser();
  }, []);

  // Fetch events
  const fetchEvents = async () => {
    if (!userId) return;

    try {
      const response = await fetch("/api/events", {
        headers: {
          "x-user-id": userId,
          "x-is-admin": String(isAdmin),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      setEvents(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and set up polling
  useEffect(() => {
    if (!userId) return;

    fetchEvents();

    // Poll for updates every 30 seconds to reduce API calls
    const interval = setInterval(fetchEvents, 30000);
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userId, isAdmin]);

  const handleEventCreated = (newEvent: Event) => {
    setEvents([newEvent, ...events]);
  };

  const handleEventUpdate = (updatedEvent: Event) => {
    setEvents(events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
  };

  const handleEventDelete = (eventId: string) => {
    setEvents(events.filter((e) => e.id !== eventId));
  };

  const handleSpotlight = async (eventId: string, isSpotlighted: boolean) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
          "x-is-admin": String(isAdmin),
        },
        body: JSON.stringify({ isSpotlighted }),
      });

      if (response.ok) {
        const updated = await response.json();
        handleEventUpdate(updated);
      }
    } catch (err) {
      console.error("Failed to update spotlight status:", err);
    }
  };

  const toggleAdminMode = async () => {
    if (!isAdmin) {
      // Entering admin mode - require password
      const password = prompt("Enter admin password:");
      
      if (!password) {
        // User cancelled the prompt
        return;
      }

      // Verify password server-side
      try {
        const response = await fetch('/api/auth/verify-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        });

        if (response.ok) {
          // Password is correct
          localStorage.setItem("isAdmin", "true");
          setIsAdmin(true);
        } else {
          alert("Incorrect password. Admin mode access denied.");
        }
      } catch (error) {
        console.error('Failed to verify password:', error);
        alert("Error verifying password. Please try again.");
      }
    } else {
      // Exiting admin mode
      localStorage.setItem("isAdmin", "false");
      setIsAdmin(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Event Counter
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Real-time event tracking
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
              <p className="text-xs md:text-sm text-gray-600">
                ID: {userId.substring(0, 10)}...
              </p>
              <button
                onClick={toggleAdminMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition text-sm md:text-base ${
                  isAdmin
                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isAdmin ? (
                  <>
                    <LogOut size={18} />
                    Exit Admin
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Admin Mode
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Create Event Form (Admin Only) */}
        {isAdmin && (
          <CreateEventForm
            isAdmin={isAdmin}
            onEventCreated={handleEventCreated}
          />
        )}

        {/* Events List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-600">
              {isAdmin
                ? "No events created yet. Create one above to get started."
                : "No events available at this time."}
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
              {isAdmin ? "All Events" : "Events"}
            </h2>
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isAdmin={isAdmin}
                onUpdate={handleEventUpdate}
                onDelete={handleEventDelete}
                onSpotlight={handleSpotlight}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
