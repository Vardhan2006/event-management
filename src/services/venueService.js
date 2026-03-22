import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  timeout: 8000,
});

export async function getVenues() {
  const response = await API.get("/venues");
  return response.data;
}

export async function getVenueById(id) {
  const response = await API.get(`/venues/${id}`);
  return response.data;
}

/**
 * Create venue with optional image uploads.
 * Pass a FormData instance built in VenueForm (field name "images" for files).
 *
 * Important: Do not set Content-Type manually — the browser/axios must add
 * the multipart boundary. Axios strips a generic "multipart/form-data" header
 * for FormData so the boundary is correct.
 */
export async function createVenue(formData) {
  if (!(formData instanceof FormData)) {
    // eslint-disable-next-line no-console
    console.warn("[venueService] createVenue expected FormData, got:", typeof formData);
  } else {
    // eslint-disable-next-line no-console
    console.log("[venueService] FormData entries:");
    for (const [key, value] of formData.entries()) {
      // eslint-disable-next-line no-console
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size}b)` : value);
    }
  }

  const response = await API.post("/venues", formData, {
    // Required for large multipart payloads in some environments
    maxContentLength: Infinity,
    maxBodyLength: Infinity
    // headers: omit — axios sets multipart/form-data + boundary for FormData
  });

  // eslint-disable-next-line no-console
  console.log("[venueService] createVenue API response:", response.data);

  return response.data;
}

const venueService = {
  getVenues,
  getVenueById,
  createVenue,
};

export default venueService;

