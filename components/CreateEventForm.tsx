'use client';

import { useState } from 'react';
import type { Event } from '@/lib/db/schema';

interface CreateEventFormProps {
  isAdmin: boolean;
  onEventCreated: (event: Event) => void;
}

export function CreateEventForm({ isAdmin, onEventCreated }: CreateEventFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSpotlighted, setIsSpotlighted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('userId') || '',
          'x-is-admin': String(isAdmin),
        },
        body: JSON.stringify({
          name,
          description,
          isSpotlighted,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const newEvent = await response.json();
      onEventCreated(newEvent);
      setName('');
      setDescription('');
      setIsSpotlighted(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-indigo-500">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Create Event</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Event Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter event name"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter event description"
            rows={3}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="spotlight"
            checked={isSpotlighted}
            onChange={(e) => setIsSpotlighted(e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
          />
          <label htmlFor="spotlight" className="ml-2 text-gray-700 font-semibold">
            Spotlight this event (visible to all users)
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}
