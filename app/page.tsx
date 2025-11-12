'use client';

import { useState, useEffect } from 'react';
import { EventCard } from '@/components/EventCard';
import { CreateEventForm } from '@/components/CreateEventForm';
import type { Event } from '@/lib/db/schema';

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Initialize user session
  useEffect(() => {
    const initializeUser = async () => {
      let storedUserId = localStorage.getItem('userId');
      const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';

      if (!storedUserId) {
        // Generate a new user ID for this session
        storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('userId', storedUserId);
        localStorage.setItem('isAdmin', 'false');
      }

      // Register user in database
      try {
        await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: storedUserId,
            email: `${storedUserId}@example.com`,
            name: 'User',
            isAdmin: storedIsAdmin,
          }),
        });
      } catch (err) {
        console.error('Failed to register user:', err);
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
      const response = await fetch('/api/events', {
        headers: {
          'x-user-id': userId,
          'x-is-admin': String(isAdmin),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
    setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  };

  const handleEventDelete = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  const handleSpotlight = async (eventId: string, isSpotlighted: boolean) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-is-admin': String(isAdmin),
        },
        body: JSON.stringify({ isSpotlighted }),
      });

      if (response.ok) {
        const updated = await response.json();
        handleEventUpdate(updated);
      }
    } catch (err) {
      console.error('Failed to update spotlight status:', err);
    }
  };

  const toggleAdminMode = () => {
    if (!isAdmin) {
      // Entering admin mode - require password
      const password = prompt('Enter admin password:');
      if (password === 'admin123') {
        localStorage.setItem('isAdmin', 'true');
        setIsAdmin(true);
      } else {
        alert('Incorrect password. Admin mode access denied.');
      }
    } else {
      // Exiting admin mode
      localStorage.setItem('isAdmin', 'false');
      setIsAdmin(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Event Counter</h1>
              <p className="text-blue-100 mt-1">Real-time event tracking with admin controls</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100 mb-2">User ID: {userId.substring(0, 12)}...</p>
              <button
                onClick={toggleAdminMode}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  isAdmin
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                {isAdmin ? '👑 Admin Mode' : 'User Mode'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Create Event Form (Admin Only) */}
        {isAdmin && <CreateEventForm isAdmin={isAdmin} onEventCreated={handleEventCreated} />}

        {/* Events List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg">
              {isAdmin ? 'No events created yet. Create one to get started!' : 'No spotlighted events available.'}
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {isAdmin ? 'All Events' : 'Available Events'}
            </h2>
            {events.map(event => (
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

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-bold text-gray-800 mb-3">How it works:</h3>
          <ul className="text-gray-700 space-y-2">
            <li>✨ <strong>Admins:</strong> Click the button in the top right to switch to admin mode, create events, and spotlight them</li>
            <li>👥 <strong>Users:</strong> See only spotlighted events and can increment counters for adults, kids, newsletter signups, and volunteers</li>
            <li>🔄 <strong>Real-time:</strong> All changes are persisted to the Turso database and visible to all users immediately</li>
            <li>💾 <strong>Persistent:</strong> Event data survives page refreshes and is stored in the database</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
