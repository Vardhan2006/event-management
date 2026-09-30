import API from "./api";

export async function getVenues(params = {}) {
  const response = await API.get("/venues", { params });
  return {
    data: response.data,
    totalCount: parseInt(response.headers["x-total-count"] || "0", 10),
    page: parseInt(response.headers["x-page"] || "1", 10),
    limit: parseInt(response.headers["x-limit"] || "100", 10),
    totalPages: parseInt(response.headers["x-total-pages"] || "1", 10),
  };
}

export async function getVenuesMeta() {
  const response = await API.get("/venues/meta");
  return response.data;
}

export async function getOwnerVenues() {
  const response = await API.get("/venues/mine");
  return response.data;
}

export async function getVenueById(id) {
  const response = await API.get(`/venues/${id}`);
  return response.data;
}

export async function getVenueAvailability(id, month) {
  const response = await API.get(`/venues/${id}/availability`, {
    params: { month },
  });
  return response.data;
}

export async function createVenue(formData) {
  const response = await API.post("/venues", formData, {
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  return response.data;
}

export async function updateVenue(id, formData) {
  const response = await API.patch(`/venues/${id}`, formData, {
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  return response.data;
}

export async function deleteVenue(id) {
  const response = await API.delete(`/venues/${id}`);
  return response.data;
}

const venueService = {
  getVenues,
  getVenuesMeta,
  getOwnerVenues,
  getVenueById,
  getVenueAvailability,
  createVenue,
  updateVenue,
  deleteVenue,
};

export default venueService;
