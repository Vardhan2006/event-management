import { useEffect, useState } from "react";
import EventCard from "../components/events/EventCard";
import Loader from "../components/common/Loader";
import eventService from "../services/eventService";
import { EVENT_CATEGORIES } from "../utils/constants";

function Events() {
  const [events, setEvents] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const data = await eventService.getEvents();
        setEvents(data || []);
      } catch (err) {
        setError("We ran into an issue loading events.");
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const visibleEvents = filteredCategory
    ? events.filter((e) => e.category === filteredCategory)
    : events;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Discover events</h1>
          <p className="page-subtitle">
            Explore what&apos;s happening across conferences, meetups, workshops,
            and more.
          </p>
        </div>
        <div>
          <select
            className="form-select"
            value={filteredCategory}
            onChange={(e) => setFilteredCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {EVENT_CATEGORIES.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <Loader label="Loading events..." />}

      {!loading && error && (
        <div className="card">
          <div className="card-title">Something went wrong</div>
          <div className="card-subtitle">{error}</div>
        </div>
      )}

      {!loading && !error && visibleEvents.length === 0 && (
        <div className="card">
          <div className="card-title">No events yet</div>
          <div className="card-subtitle">
            Once events are published, they will appear here.
          </div>
        </div>
      )}

      {!loading && !error && visibleEvents.length > 0 && (
        <div className="grid grid-3">
          {visibleEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Events;