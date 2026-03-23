import { useEffect, useRef, useState } from "react";

function toCommaList(values) {
  if (!values) return "";
  if (Array.isArray(values)) return values.join(", ");
  return String(values);
}

const MAX_IMAGES = 5;

function VenueForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  initialValues,
  isEditMode = false,
  syncKey = "new",
}) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    pricePerDay: "",
    description: "",
    services: "",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const initialValuesRef = useRef(initialValues);
  initialValuesRef.current = initialValues;

  useEffect(() => {
    const iv = initialValuesRef.current || {};
    setFormData({
      name: iv.name != null ? String(iv.name) : "",
      location: iv.location != null ? String(iv.location) : "",
      capacity: iv.capacity != null ? String(iv.capacity) : "",
      pricePerDay:
        iv.pricePerDay != null && iv.pricePerDay !== ""
          ? String(iv.pricePerDay)
          : "",
      description: iv.description != null ? String(iv.description) : "",
      services: toCommaList(iv.services),
    });
    setImageFiles([]);
  }, [syncKey]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilesChange = (e) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    setImageFiles(list.slice(0, MAX_IMAGES));
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

    if (isEditMode && Array.isArray(initialValues?.images)) {
      fd.append("existingImages", JSON.stringify(initialValues.images));
    }

    imageFiles.forEach((file) => {
      fd.append("images", file);
    });

    onSubmit(fd);
  };

  const title = isEditMode ? "Edit venue" : "Create a venue";
  const subtitle = isEditMode
    ? "Update your listing. New photos are added to your existing images."
    : "Add your space so people can request bookings.";
  const submitLabel = isEditMode ? "Update venue" : "Create venue";

  return (
    <form className="form card venue-form" onSubmit={handleSubmit}>
      <div className="venue-form-header-row">
        <div>
          <div className="form-title">{title}</div>
          <div className="form-subtitle">{subtitle}</div>
        </div>
        {onCancel && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Close
          </button>
        )}
      </div>

      {isEditMode && initialValues?.images?.length > 0 && (
        <div className="form-group">
          <span className="form-label">Current photos</span>
          <div className="venue-form-existing-images">
            {initialValues.images.slice(0, 5).map((url) => (
              <img key={url} src={url} alt="" className="venue-form-thumb" />
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="venue-images">
          {isEditMode ? "Add more photos (optional)" : `Photos (up to ${MAX_IMAGES})`}
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
            {imageFiles.length} new file(s) selected
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
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

export default VenueForm;
