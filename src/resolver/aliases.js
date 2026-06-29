/**
 * Resolver alias tables.
 * Lists supported destination IDs and the phrases that map to each one.
 */
export const DESTINATION_IDS = Object.freeze(["about", "events", "projects", "members", "join", "contact"]);

export const DESTINATION_ALIASES = Object.freeze({
  about: ["about", "mission", "club", "aimla", "what is aimla", "who are you", "tell me about", "what do you do"],
  events: ["events", "event", "workshops", "workshop", "sessions", "upcoming", "hackathon", "meetup", "what events"],
  projects: ["projects", "project", "portfolio", "build", "technical", "coding", "what have you built", "what do you build"],
  members: ["members", "team", "community", "students", "people", "executives", "contributors"],
  join: ["join", "signup", "register", "start","get involved", "become a member","how do i join"],
  contact: ["contact", "email", "reach out", "connect", "message", "get in touch", "how do i contact"]
});
