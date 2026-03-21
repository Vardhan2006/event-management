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

export async function createVenue(payload) {
  const response = await API.post("/venues", payload, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
}

const venueService = {
  getVenues,
  getVenueById,
  createVenue,
};

export default venueService;

