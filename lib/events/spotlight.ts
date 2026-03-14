type SpotlightCandidate = {
  id: string;
  eventDate?: string | null;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function getStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseEventDate(eventDate?: string | null) {
  if (!eventDate) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(eventDate);
  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return getStartOfDay(parsed);
}

export function getSpotlightEventId(
  events: SpotlightCandidate[],
  now: Date = new Date(),
) {
  const today = getStartOfDay(now).getTime();

  let selectedEventId: string | null = null;
  let selectedDistance = Number.POSITIVE_INFINITY;
  let selectedDateValue = Number.POSITIVE_INFINITY;

  for (const event of events) {
    const parsedEventDate = parseEventDate(event.eventDate);
    if (!parsedEventDate) {
      continue;
    }

    const eventDateValue = parsedEventDate.getTime();
    const distance = Math.abs(eventDateValue - today) / DAY_IN_MS;

    if (
      distance < selectedDistance ||
      (distance === selectedDistance && eventDateValue < selectedDateValue) ||
      (distance === selectedDistance &&
        eventDateValue === selectedDateValue &&
        event.id < (selectedEventId ?? ""))
    ) {
      selectedEventId = event.id;
      selectedDistance = distance;
      selectedDateValue = eventDateValue;
    }
  }

  return selectedEventId;
}

export function applyAutomaticSpotlight<T extends SpotlightCandidate & { isSpotlighted: boolean }>(
  events: T[],
  now: Date = new Date(),
) {
  const spotlightEventId = getSpotlightEventId(events, now);

  return events.map((event) => ({
    ...event,
    isSpotlighted: event.id === spotlightEventId,
  }));
}
