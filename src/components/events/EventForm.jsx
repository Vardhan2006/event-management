import { useState } from "react";
import { EVENT_CATEGORIES } from "../../utils/constants";

const initialState = {
  title: "",
  description: "",
  date: "",
  location: "",
  category: "",
};

function EventForm({ onSubmit, isSubmitting = false }) {
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.date) {
      return;
    }
    onSubmit(formData);
  };

  return (
    <form className="form card" onSubmit={handleSubmit}>
      <div className="form-title">Create a new event</div>
      <div className="form-subtitle">
        Share your event with the community in just a few steps.
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="title">
          Event title
        </label>
        <input
          id="title"
          name="title"
          className="form-input"
          placeholder="e.g. Product Leadership Summit"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className="form-textarea"
          placeholder="Describe what attendees can expect from your event."
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="date">
          Date &amp; time
        </label>
        <input
          id="date"
          name="date"
          type="datetime-local"
          className="form-input"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="location">
          Location
        </label>
        <input
          id="location"
          name="location"
          className="form-input"
          placeholder="e.g. San Francisco, CA or Online"
          value={formData.location}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="category">
          Category
        </label>
        <select
          id="category"
          name="category"
          className="form-select"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="">Select a category</option>
          {EVENT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <button
        className="btn btn-primary btn-full"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating event..." : "Create event"}
      </button>
    </form>
  );
}

export default EventForm;