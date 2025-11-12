"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Event } from "@/lib/db/schema";

interface CreateEventFormProps {
  isAdmin: boolean;
  onEventCreated: (event: Event) => void;
}

export function CreateEventForm({
  isAdmin,
  onEventCreated,
}: CreateEventFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSpotlighted, setIsSpotlighted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": localStorage.getItem("userId") || "",
          "x-is-admin": String(isAdmin),
        },
        body: JSON.stringify({
          name,
          description,
          isSpotlighted,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      const newEvent = await response.json();
      onEventCreated(newEvent);
      setName("");
      setDescription("");
      setIsSpotlighted(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
        Create New Event
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
            placeholder="Enter event name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
            placeholder="Event description (optional)"
            rows={3}
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="spotlight"
            checked={isSpotlighted}
            onChange={(e) => setIsSpotlighted(e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
          <label
            htmlFor="spotlight"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            Spotlight this event (visible to all users)
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition text-sm md:text-base"
        >
          <Plus size={20} />
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}
