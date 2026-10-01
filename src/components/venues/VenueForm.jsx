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

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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

  const title = isEditMode ? "Edit Venue Listing" : "Create New Venue";
  const submitLabel = isEditMode ? "Update Venue" : "Save & Publish Venue";

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && onCancel) {
          onCancel();
        }
      }}
    >
      <div className="modal-panel">
        {/* Sticky Header */}
        <div className="modal-header">
          <div>
            <span className="eyebrow">{isEditMode ? "Update Listing" : "New Property"}</span>
            <h2 style={{ fontSize: 24, fontWeight: 900 }}>{title}</h2>
          </div>
          {onCancel && (
            <button
              type="button"
              className="modal-close-btn"
              onClick={onCancel}
              disabled={isSubmitting}
              aria-label="Close modal"
            >
              ✕
            </button>
          )}
        </div>

        {/* Modal Body Form */}
        <form id="venue-modal-form" onSubmit={handleSubmit} className="modal-body stack-lg">
          {/* Current Images Preview */}
          {isEditMode && initialValues?.images?.length > 0 && (
            <div className="field">
              <span className="eyebrow">Current Photos</span>
              <div className="row-wrap" style={{ gap: 10, marginTop: 6 }}>
                {initialValues.images.slice(0, 5).map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt=""
                    style={{ width: 72, height: 54, borderRadius: 8, objectFit: "cover", border: "1px solid var(--line-soft)" }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Image Upload Dropzone Style */}
          <div className="field">
            <label htmlFor="venue-images">
              {isEditMode ? "Upload Additional Photos (Optional)" : `Photos (up to ${MAX_IMAGES})`}
            </label>
            <div
              style={{
                border: "2px dashed var(--line-soft)",
                borderRadius: "var(--radius-card)",
                padding: "20px",
                textAlign: "center",
                backgroundColor: "var(--bg)",
                cursor: "pointer",
              }}
            >
              <input
                id="venue-images"
                name="images"
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
                multiple
                className="input"
                style={{ cursor: "pointer", height: "auto", padding: "10px" }}
                onChange={handleFilesChange}
              />
              <p className="text-sm text-muted" style={{ marginTop: 8 }}>
                Accepted formats: JPG, PNG, WEBP. Max {MAX_IMAGES} files.
              </p>
            </div>
            {imageFiles.length > 0 && (
              <p className="text-sm text-ink font-semibold" style={{ marginTop: 6 }}>
                ✓ {imageFiles.length} new photo(s) selected
              </p>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid-2">
            <div className="field">
              <label htmlFor="name">Venue Name</label>
              <input
                id="name"
                name="name"
                type="text"
                className="input"
                placeholder="e.g. Grand Horizon Ballroom"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="location">Location / City</label>
              <input
                id="location"
                name="location"
                type="text"
                className="input"
                placeholder="e.g. New York, NY"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="capacity">Guest Capacity</label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min="0"
                className="input"
                placeholder="e.g. 250"
                value={formData.capacity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="pricePerDay">Price Per Day ($)</label>
              <input
                id="pricePerDay"
                name="pricePerDay"
                type="number"
                min="0"
                step="0.01"
                className="input"
                placeholder="e.g. 1500"
                value={formData.pricePerDay}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="description">Full Description</label>
            <textarea
              id="description"
              name="description"
              className="textarea"
              placeholder="Describe venue highlights, dimensions, parking, and rules..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="services">Services & Amenities (Comma-Separated)</label>
            <input
              id="services"
              name="services"
              type="text"
              className="input"
              placeholder="Catering, Stage, WiFi, Projector, Sound System"
              value={formData.services}
              onChange={handleChange}
            />
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="modal-footer">
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            form="venue-modal-form"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving Venue..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VenueForm;
