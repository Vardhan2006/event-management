import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EventForm from "../components/events/EventForm";
import eventService from "../services/eventService";

function CreateEvent() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (data) => {
    try {
      setError("");
      setSubmitting(true);
      await eventService.createEvent(data);
      navigate("/events");
    } catch (err) {
      setError("We couldn&apos;t create your event. Please try again.");
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Create event</h1>
          <p className="page-subtitle">
            Share your next conference, meetup, or workshop with the community.
          </p>
        </div>
      </div>
      {error && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Couldn&apos;t save event</div>
          <div className="card-subtitle">{error}</div>
        </div>
      )}
      <EventForm onSubmit={handleCreate} isSubmitting={submitting} />
    </div>
  );
}

export default CreateEvent;