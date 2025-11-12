import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { events } from '@/lib/db/schema';
import { eq, ne } from 'drizzle-orm';

type RouteParams = {
  params: {
    id: string;
  };
};

// Get a specific event
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const event = await db.select().from(events).where(eq(events.id, id));

    if (!event.length) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

// Update event spotlight status or counters
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const userId = request.headers.get('x-user-id');
    const isAdmin = request.headers.get('x-is-admin') === 'true';
    const body = await request.json();

    // Check if event exists
    const event = await db.select().from(events).where(eq(events.id, id));
    if (!event.length) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check authorization for admin-only changes
    if (('isSpotlighted' in body || 'name' in body || 'description' in body) && !isAdmin) {
      return NextResponse.json({ error: 'Only admins can modify event details' }, { status: 403 });
    }

    // Build update object based on provided fields
    const updateData: any = {};
    
    if ('isSpotlighted' in body) {
      updateData.isSpotlighted = body.isSpotlighted;
      
      // If spotlighting this event, unspotlight all other events
      if (body.isSpotlighted === true) {
        await db
          .update(events)
          .set({ isSpotlighted: false, updatedAt: new Date() })
          .where(ne(events.id, id));
      }
    }

    if ('name' in body) {
      updateData.name = body.name;
    }

    if ('description' in body) {
      updateData.description = body.description;
    }
    
    // Allow any user to increment counters (increment fields)
    if ('adults' in body) {
      updateData.adults = body.adults;
    }
    if ('kids' in body) {
      updateData.kids = body.kids;
    }
    if ('newsletterSignups' in body) {
      updateData.newsletterSignups = body.newsletterSignups;
    }
    if ('volunteers' in body) {
      updateData.volunteers = body.volunteers;
    }

    updateData.updatedAt = new Date();

    const updated = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// Delete event (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const isAdmin = request.headers.get('x-is-admin') === 'true';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Only admins can delete events' }, { status: 403 });
    }

    await db.delete(events).where(eq(events.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
