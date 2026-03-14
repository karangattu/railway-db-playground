# Event Counter App

A real-time event counter application built with Next.js and Turso database. Admins can create and spotlight events, while users can track and increment counters for adults, kids, newsletter signups, and volunteers.

## Haptics (Vibration) Troubleshooting

This app includes optional haptic feedback when counters are incremented. You can toggle this in the header ("Haptics" button). The setting is persisted in localStorage.

If haptic feedback isn't working on Android / Chrome, try the following:

- Ensure the device isn't in battery saver / power saving mode — vibration may be disabled in these modes.
- Check that vibration controls are enabled in system settings.
- Use a real device (some emulators don't support vibration), and ensure the page is in the foreground.
- If `Haptics` is enabled but nothing happens, open DevTools and check for console messages indicating the Vibration API isn't available.

