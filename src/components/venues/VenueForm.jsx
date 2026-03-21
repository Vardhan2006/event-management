import { useMemo, useState } from "react";

function toCommaList(values) {
  if (!values) return "";
  if (Array.isArray(values)) return values.join(", ");
  return String(values);
}

function VenueForm({ onSubmit, isSubmitting = false, initialValues }) {
  const preset = useMemo(
    () => ({
      name: "",
      location: "",
      capacity: "",
      pricePerDay: "",
      description: "",
      services: "",
      ...(initialValues || {}),
    }),
    [initialValues]
  );

  const [formData, setFormData] = useState(() => ({
    ...preset,
    services: toCommaList(preset.services),
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.capacity) return;

    const payload = {
      name: formData.name.trim(),
      location: formData.location.trim(),
      capacity: Number(formData.capacity),
      pricePerDay: Number(formData.pricePerDay || 0),
      description: formData.description?.trim() || "",
      services: formData.services
        ? formData.services
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };

    onSubmit(payload);
  };

  return (
    <form className="form card venue-form" onSubmit={handleSubmit}>
      <div className="form-title">Create a venue</div>
      <div className="form-subtitle">
        Add your space so people can request bookings.
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="name">
          Venue name
        </label>
        <input
          id="name"
          name="name"
          className="form-input"
          value={formData.name}
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
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid venue-form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="capacity">
            Capacity
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min="0"
            className="form-input"
            value={formData.capacity}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="pricePerDay">
            Price per day
          </label>
          <input
            id="pricePerDay"
            name="pricePerDay"
            type="number"
            min="0"
            step="0.01"
            className="form-input"
            value={formData.pricePerDay}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className="form-textarea"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="services">
          Services (comma-separated)
        </label>
        <input
          id="services"
          name="services"
          className="form-input"
          placeholder="catering, decoration"
          value={formData.services}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Create venue"}
      </button>
    </form>
  );
}

export default VenueForm;

