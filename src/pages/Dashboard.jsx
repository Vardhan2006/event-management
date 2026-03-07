import { MOCK_EVENTS } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/events/EventCard";

function Dashboard() {
  const { user } = useAuth();

  const createdEvents = MOCK_EVENTS.slice(0, 2);
  const registeredEvents = MOCK_EVENTS.slice(2);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {user?.name ? `${user.name.split(" ")[0]}'s` : "Your"} dashboard
          </h1>
          <p className="page-subtitle">
            Quickly access events you are running or attending.
          </p>
        </div>
      </div>

      <div className="grid grid-2">
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Events you&apos;re hosting</h2>
            <p className="card-subtitle">
              Drafts and published events you created.
            </p>
          </div>
          {createdEvents.length === 0 ? (
            <p className="text-muted text-sm">
              You haven&apos;t created any events yet.
            </p>
          ) : (
            <div className="grid">
              {createdEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Events you&apos;re attending</h2>
            <p className="card-subtitle">
              A snapshot of your upcoming registrations.
            </p>
          </div>
          {registeredEvents.length === 0 ? (
            <p className="text-muted text-sm">
              Once you register for an event, it will appear here.
            </p>
          ) : (
            <div className="grid">
              {registeredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;