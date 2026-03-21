export const APP_NAME = "EventFlow";

export const THEME = {
  primary: "#6C63FF",
  secondary: "#FF6B6B",
  accent: "#FFD166",
  background: "#F4F6F9",
  cardBackground: "#FFFFFF",
  text: "#2D2D2D",
  border: "#E0E0E0",
};

export const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Venues", to: "/venues" },

  // 👤 User only
  { label: "My Bookings", to: "/my-bookings", requiresAuth: true, role: "user" },

  // 👑 Owner only
  { label: "Owner Dashboard", to: "/owner-dashboard", requiresAuth: true, role: "owner" }
];

export const EVENT_CATEGORIES = [
  "Conference",
  "Workshop",
  "Meetup",
  "Webinar",
  "Networking",
];

export const MOCK_EVENTS = [
  {
    id: "1",
    title: "Product Leadership Summit 2026",
    date: "2026-04-15T09:00:00Z",
    location: "San Francisco, CA",
    category: "Conference",
    organizer: "Product Leaders Collective",
    description:
      "A one-day summit bringing together product leaders to share strategies on building customer-centric products at scale.",
    shortDescription:
      "Summit for product leaders on building customer-centric products.",
    attendees: 320,
    isOnline: false,
  },
  {
    id: "2",
    title: "Remote Engineering Meetup",
    date: "2026-04-22T17:00:00Z",
    location: "Online",
    category: "Meetup",
    organizer: "Distributed Devs",
    description:
      "A community meetup for remote engineers to share lessons learned, tools, and best practices for building strong remote cultures.",
    shortDescription:
      "Meetup for remote engineers and leaders building distributed teams.",
    attendees: 210,
    isOnline: true,
  },
  {
    id: "3",
    title: "Design Systems Workshop",
    date: "2026-05-03T13:30:00Z",
    location: "New York, NY",
    category: "Workshop",
    organizer: "UX Studio NYC",
    description:
      "Hands-on workshop covering how to design, document, and scale design systems across multiple products and teams.",
    shortDescription:
      "Hands-on workshop on building and scaling design systems.",
    attendees: 80,
    isOnline: false,
  },
  {
    id: "4",
    title: "Startup Networking Evening",
    date: "2026-05-10T18:00:00Z",
    location: "Berlin, Germany",
    category: "Networking",
    organizer: "Startup Connect Berlin",
    description:
      "An evening dedicated to founders, operators, and investors to connect, share ideas, and find collaborators in Berlin's tech scene.",
    shortDescription:
      "In-person networking for founders, operators, and investors.",
    attendees: 150,
    isOnline: false,
  },
];