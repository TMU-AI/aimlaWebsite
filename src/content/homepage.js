export const TOPICS = [
  {
    id: "about",
    label: "About",
    title: "About TMU AIMLA",
    body:
      "TMU AIMLA is a student-led association focused on artificial intelligence, machine learning, and hands-on technical learning. The club helps students explore AI tools, build real projects, attend workshops, and gain confidence with modern technology.",
    suggestedQuery: "What events are upcoming?",
    aliases: ["about", "mission", "club", "aimla", "what is aimla", "what"]
  },
  {
    id: "events",
    label: "Events",
    title: "Events and Workshops",
    body:
      "AIMLA hosts technical workshops, project sessions, networking events, and beginner-friendly learning opportunities. These events are meant to help students understand AI, machine learning, APIs, coding tools, and real-world development workflows.",
    suggestedQuery: "What kind of projects can I build?",
    aliases: ["events", "event", "workshops", "workshop", "sessions", "upcoming"]
  },
  {
    id: "projects",
    label: "Projects",
    title: "Student Projects",
    body:
      "AIMLA encourages students to build portfolio-ready projects using AI, machine learning, automation, and web development. Project work gives students practical experience and helps them prepare for internships, research, and technical interviews.",
    suggestedQuery: "How can I join AIMLA?",
    aliases: ["projects", "project", "portfolio", "build", "technical", "coding"]
  },
  {
    id: "members",
    label: "Members",
    title: "Members and Community",
    body:
      "The AIMLA community brings together students interested in AI, machine learning, software development, research, and technical growth. Members can learn together, collaborate on projects, and support one another.",
    suggestedQuery: "Do I need experience to join?",
    aliases: ["members", "team", "community", "students", "people"]
  },
  {
    id: "join",
    label: "Join",
    title: "Join AIMLA",
    body:
      "Students can join AIMLA by attending events, participating in workshops, joining project teams, and connecting with the club community. No advanced AI experience is required, so beginners are welcome.",
    suggestedQuery: "What events are good for beginners?",
    aliases: ["join", "member", "signup", "register", "start"]
  }
];

export const NAV_ITEMS = TOPICS.filter(topic => topic.id !== "projects").map(
  ({ id, label, title }) => ({ id, label, title })
);

export const QUICK_PROMPTS = [
  { label: "What is AIMLA?", topicId: "about" },
  { label: "What events are upcoming?", topicId: "events" },
  { label: "What kind of projects can I build?", topicId: "projects" },
  { label: "How do I join AIMLA?", topicId: "join" }
];

export const FALLBACK_MESSAGE =
  "I can help with AIMLA, events, projects, members, or joining. Try a topic button or ask a shorter question.";

const DEFAULT_TOPIC = TOPICS[0];

export function normalizeText(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getTopic(topicId) {
  return TOPICS.find(topic => topic.id === topicId) || DEFAULT_TOPIC;
}

export function resolveTopic(question) {
  const normalizedQuestion = normalizeText(question);

  if (!normalizedQuestion) {
    return null;
  }

  return TOPICS.find(topic =>
    topic.aliases.some(alias => {
      const normalizedAlias = normalizeText(alias);

      return (
        normalizedQuestion === normalizedAlias ||
        normalizedQuestion.includes(normalizedAlias) ||
        normalizedAlias.includes(normalizedQuestion)
      );
    })
  );
}

export const DEFAULT_TOPIC_ID = DEFAULT_TOPIC.id;
