'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Event } from '@/lib/db/schema';

interface EventCardProps {
  event: Event;
  isAdmin: boolean;
  onUpdate: (updatedEvent: Event) => void;
  onDelete?: (eventId: string) => void;
  onSpotlight?: (eventId: string, isSpotlighted: boolean) => void;
}

export function EventCard({ event, isAdmin, onUpdate, onDelete, onSpotlight }: EventCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(event.name);
  const [editDescription, setEditDescription] = useState(event.description || '');

  const incrementCounter = useCallback(async (field: string) => {
    try {
      const newValue = event[field as keyof Event] as number + 1;
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('userId') || '',
          'x-is-admin': String(isAdmin),
        },
        body: JSON.stringify({
          [field]: newValue,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        onUpdate(updated);
      }
    } catch (error) {
      console.error(`Failed to increment ${field}:`, error);
    }
  }, [event, isAdmin, onUpdate]);

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('userId') || '',
          'x-is-admin': String(isAdmin),
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        onUpdate(updated);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${event.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': localStorage.getItem('userId') || '',
          'x-is-admin': String(isAdmin),
        },
      });

      if (response.ok) {
        onDelete?.(event.id);
      } else {
        alert('Failed to delete event');
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Error deleting event');
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-blue-500">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Event</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Event Name</label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Event name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Description</label>
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Event description (optional)"
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSaveEdit}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition"
          >
            Save Changes
          </button>
          <button
            onClick={() => {
              setEditName(event.name);
              setEditDescription(event.description || '');
              setIsEditing(false);
            }}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{event.name}</h2>
          {event.description && (
            <p className="text-gray-600 mt-2">{event.description}</p>
          )}
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => onSpotlight?.(event.id, !event.isSpotlighted)}
              className={`px-4 py-2 rounded font-semibold transition whitespace-nowrap ${
                event.isSpotlighted
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {event.isSpotlighted ? '⭐ Spotlighted' : 'Spotlight'}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded font-semibold transition bg-blue-500 hover:bg-blue-600 text-white"
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded font-semibold transition bg-red-500 hover:bg-red-600 text-white"
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Adults Counter */}
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-gray-600 text-sm font-semibold mb-2">Adults</p>
          <p className="text-3xl font-bold text-blue-600 mb-3">{event.adults}</p>
          <button
            onClick={() => incrementCounter('adults')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition"
          >
            +1
          </button>
        </div>

        {/* Kids Counter */}
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-gray-600 text-sm font-semibold mb-2">Kids</p>
          <p className="text-3xl font-bold text-green-600 mb-3">{event.kids}</p>
          <button
            onClick={() => incrementCounter('kids')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition"
          >
            +1
          </button>
        </div>

        {/* Newsletter Signups Counter */}
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <p className="text-gray-600 text-sm font-semibold mb-2">Newsletter</p>
          <p className="text-3xl font-bold text-purple-600 mb-3">{event.newsletterSignups}</p>
          <button
            onClick={() => incrementCounter('newsletterSignups')}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition"
          >
            +1
          </button>
        </div>

        {/* Volunteers Counter */}
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <p className="text-gray-600 text-sm font-semibold mb-2">Volunteers</p>
          <p className="text-3xl font-bold text-orange-600 mb-3">{event.volunteers}</p>
          <button
            onClick={() => incrementCounter('volunteers')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition"
          >
            +1
          </button>
        </div>
      </div>
    </div>
  );
}
