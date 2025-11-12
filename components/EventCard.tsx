'use client';

import { useState, useCallback } from 'react';
import { Star, Edit2, Trash2, Save, X } from 'lucide-react';
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
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 border border-gray-200">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Edit Event</h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
              placeholder="Event name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
              placeholder="Event description"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSaveEdit}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition text-sm md:text-base"
          >
            <Save size={18} />
            Save
          </button>
          <button
            onClick={() => {
              setEditName(event.name);
              setEditDescription(event.description || '');
              setIsEditing(false);
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition text-sm md:text-base"
          >
            <X size={18} />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 break-words">{event.name}</h2>
          {event.description && (
            <p className="text-gray-600 mt-2 text-sm md:text-base">{event.description}</p>
          )}
        </div>

        {isAdmin && (
          <div className="flex gap-2 flex-shrink-0 w-full md:w-auto">
            <button
              onClick={() => onSpotlight?.(event.id, !event.isSpotlighted)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition text-sm md:text-base ${
                event.isSpotlighted
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={event.isSpotlighted ? 'Remove spotlight' : 'Add spotlight'}
            >
              <Star size={18} />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium transition text-sm md:text-base"
              title="Edit event"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition text-sm md:text-base"
              title="Delete event"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Adults Counter */}
        <div className="bg-blue-50 p-3 md:p-4 rounded-lg text-center border border-blue-100">
          <p className="text-xs md:text-sm font-semibold text-gray-600 mb-2">Adults</p>
          <p className="text-2xl md:text-3xl font-bold text-blue-600 mb-3">{event.adults}</p>
          <button
            onClick={() => incrementCounter('adults')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-md transition text-sm md:text-base"
          >
            +1
          </button>
        </div>

        {/* Kids Counter */}
        <div className="bg-green-50 p-3 md:p-4 rounded-lg text-center border border-green-100">
          <p className="text-xs md:text-sm font-semibold text-gray-600 mb-2">Kids</p>
          <p className="text-2xl md:text-3xl font-bold text-green-600 mb-3">{event.kids}</p>
          <button
            onClick={() => incrementCounter('kids')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-md transition text-sm md:text-base"
          >
            +1
          </button>
        </div>

        {/* Newsletter Signups Counter */}
        <div className="bg-purple-50 p-3 md:p-4 rounded-lg text-center border border-purple-100">
          <p className="text-xs md:text-sm font-semibold text-gray-600 mb-2">Newsletter</p>
          <p className="text-2xl md:text-3xl font-bold text-purple-600 mb-3">{event.newsletterSignups}</p>
          <button
            onClick={() => incrementCounter('newsletterSignups')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-md transition text-sm md:text-base"
          >
            +1
          </button>
        </div>

        {/* Volunteers Counter */}
        <div className="bg-orange-50 p-3 md:p-4 rounded-lg text-center border border-orange-100">
          <p className="text-xs md:text-sm font-semibold text-gray-600 mb-2">Volunteers</p>
          <p className="text-2xl md:text-3xl font-bold text-orange-600 mb-3">{event.volunteers}</p>
          <button
            onClick={() => incrementCounter('volunteers')}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-3 rounded-md transition text-sm md:text-base"
          >
            +1
          </button>
        </div>
      </div>
    </div>
  );
}
