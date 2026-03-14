import test from "node:test";
import assert from "node:assert/strict";

import { getSpotlightEventId } from "../lib/events/spotlight.ts";

test("selects exactly one spotlight event using the nearest dated event", () => {
  const spotlightId = getSpotlightEventId(
    [
      { id: "missing-date", eventDate: null },
      { id: "older", eventDate: "2026-03-10" },
      { id: "closest", eventDate: "2026-03-15" },
      { id: "farther", eventDate: "2026-03-20" },
    ],
    new Date("2026-03-14T09:00:00"),
  );

  assert.equal(spotlightId, "closest");
});

test("returns no spotlight when events do not have dates yet", () => {
  const spotlightId = getSpotlightEventId(
    [
      { id: "one", eventDate: null },
      { id: "two", eventDate: "" },
    ],
    new Date("2026-03-14T09:00:00"),
  );

  assert.equal(spotlightId, null);
});
