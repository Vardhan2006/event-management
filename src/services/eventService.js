import axios from "axios";
import { MOCK_EVENTS } from "../utils/constants";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  timeout: 8000,
});

export async function getEvents() {
  try {
    const response = await API.get("/events");
    return response.data;
  } catch (error) {
    // Fallback so UI works without a backend
    // eslint-disable-next-line no-console
    console.warn("Using mock events due to API error:", error?.message);
    return MOCK_EVENTS;
  }
}

export async function getEventById(id) {
  try {
    const response = await API.get(`/events/${id}`);
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("Using mock event due to API error:", error?.message);
    const event = MOCK_EVENTS.find((e) => String(e.id) === String(id));
    if (!event) {
      throw new Error("Event not found");
    }
    return event;
  }
}

export async function createEvent(payload) {
  const response = await API.post("/events", payload);
  return response.data;
}

const eventService = {
  getEvents,
  getEventById,
  createEvent,
};

export default eventService;