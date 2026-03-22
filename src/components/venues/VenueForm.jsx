import { useMemo, useState } from "react";

function toCommaList(values) {
  if (!values) return "";
  if (Array.isArray(values)) return values.join(", ");
  return String(values);
}

const MAX_IMAGES = 5;

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

  const [imageFiles, setImageFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilesChange = (e) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    const next = list.slice(0, MAX_IMAGES);
    setImageFiles(next);
    // eslint-disable-next-line no-console
    console.log("[VenueForm] selected files:", next.map((f) => `${f.name} (${f.size}b)`));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.capacity) return;

    const servicesArr = formData.services
      ? formData.services
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const fd = new FormData();
    fd.append("name", formData.name.trim());
    fd.append("location", formData.location.trim());
    fd.append("capacity", String(Number(formData.capacity)));
    fd.append("pricePerDay", String(Number(formData.pricePerDay || 0)));
    fd.append("description", formData.description?.trim() || "");
    fd.append("services", JSON.stringify(servicesArr));

    imageFiles.forEach((file) => {
      fd.append("images", file);
    });

    // eslint-disable-next-line no-console
    console.log("[VenueForm] FormData built — field names:", [...new Set([...fd.keys()])]);
    for (const [k, v] of fd.entries()) {
      // eslint-disable-next-line no-console
      console.log(`  ${k}:`, v instanceof File ? `File(${v.name})` : v);
    }

    onSubmit(fd);
  };

  return (
    <form className="form card venue-form" onSubmit={handleSubmit}>
      <div className="form-title">Create a venue</div>
      <div className="form-subtitle">
        Add your space so people can request bookings.
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="venue-images">
          Photos (up to {MAX_IMAGES})
        </label>
        <input
          id="venue-images"
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
          multiple
          className="form-input"
          onChange={handleFilesChange}
        />
        {imageFiles.length > 0 && (
          <p className="text-sm text-muted" style={{ marginTop: 8 }}>
            {imageFiles.length} file(s) selected
          </p>
        )}
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
