const REGISTRATION_CLOSE_WINDOW_HOURS = 24;
const REGISTRATION_CLOSE_WINDOW_MS =
  REGISTRATION_CLOSE_WINDOW_HOURS * 60 * 60 * 1000;

export type EventRegistrationWindow = {
  startsAt: string;
  keepRegistrationsOpen?: boolean | null;
};

export function isEventRegistrationOpen(
  event: EventRegistrationWindow,
  now = new Date()
) {
  if (event.keepRegistrationsOpen) {
    return true;
  }

  const startsAtTime = new Date(event.startsAt).getTime();

  if (Number.isNaN(startsAtTime)) {
    return false;
  }

  return now.getTime() < startsAtTime - REGISTRATION_CLOSE_WINDOW_MS;
}
