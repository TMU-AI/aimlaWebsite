/**
 * Resolver alias tables.
 * Lists supported destination IDs and the phrases that map to each one.
 */
export const DESTINATION_IDS = Object.freeze(["about", "events", "projects", "members", "join", "contact"]);

export const DESTINATION_ALIASES = Object.freeze({
  about: ["aimla", "what is aimla", "who are you", "about aimla", "overview", "who is aimla", "what is this club"],
  events: ["events", "event", "workshops", "workshop", "sessions", "upcoming", "hackathon", "meetup", "what events", "next event", "past events", "what is happening", "schedule", "calendar", "any events", "talks", "speaker"],
  projects: ["projects", "project", "portfolio", "build", "technical", "coding", "what have you built", "what do you build", "what are you building", "show me your work", "what did you make", "ai projects", "ml projects"],
  members: ["members", "team", "community", "students", "people", "executives", "contributors", "who runs this", "who is on the team", "leadership", "who are the members", "board", "execs", "staff"],
  join: ["join", "signup", "register", "start", "get involved", "become a member", "how do i join", "sign up", "apply", "i want to join", "membership", "volunteer"],
  contact: ["contact", "email", "reach out", "connect", "message", "get in touch", "how do i contact", "talk to someone", "send a message", "dm", "social media", "instagram"]
});
