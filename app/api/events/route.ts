import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { events, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { applyAutomaticSpotlight } from "@/lib/events/spotlight";

// Get all events. Admins see every event, users only see the auto-spotlighted one.
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const isAdmin = request.headers.get("x-is-admin") === "true";

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allEvents = await db.select().from(events);

    const eventsWithSpotlight = applyAutomaticSpotlight(allEvents);

    if (isAdmin) {
      return NextResponse.json(eventsWithSpotlight);
    }

    return NextResponse.json(
      eventsWithSpotlight.filter((event) => event.isSpotlighted),
    );
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

// Create a new event (admin only)
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const isAdmin = request.headers.get("x-is-admin") === "true";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only admins can create events" },
        { status: 403 },
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 },
      );
    }

    // Ensure user exists in database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    if (existingUser.length === 0) {
      // Create user if they don't exist
      await db.insert(users).values({
        id: userId,
        email: `${userId}@example.com`,
        name: "User",
        isAdmin: true,
      });
    }

    const body = await request.json();
    const { name, description, eventDate } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Event name is required" },
        { status: 400 },
      );
    }

    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newEvent = await db
      .insert(events)
      .values({
        id: eventId,
        name,
        description: description || "",
        eventDate: eventDate || null,
        isSpotlighted: false,
        createdBy: userId,
        adults: 0,
        kids: 0,
        newsletterSignups: 0,
        volunteers: 0,
      })
      .returning();

    const allEvents = await db.select().from(events);
    const eventsWithSpotlight = applyAutomaticSpotlight(allEvents);
    const createdEvent = eventsWithSpotlight.find((event) => event.id === eventId);

    return NextResponse.json(createdEvent ?? newEvent[0], { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}
