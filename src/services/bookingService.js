import API from "./api";

export async function createBooking(data) {
  const response = await API.post("/bookings", data);
  return response.data;
}

export async function getUserBookings(params = {}) {
  const response = await API.get("/bookings/mine", { params });
  return response.data;
}

export async function getOwnerBookings(params = {}) {
  const response = await API.get("/bookings/owner", { params });
  return response.data;
}

export async function getBookingById(id) {
  const response = await API.get(`/bookings/${id}`);
  return response.data;
}

export async function reviewBookingStatus(id, status) {
  const response = await API.patch(`/bookings/${id}/status`, { status });
  return response.data;
}

export async function cancelBooking(id) {
  const response = await API.patch(`/bookings/${id}/cancel`);
  return response.data;
}

export async function getOwnerStats() {
  const response = await API.get("/owner/stats");
  return response.data;
}

const bookingService = {
  createBooking,
  getUserBookings,
  getOwnerBookings,
  getBookingById,
  reviewBookingStatus,
  cancelBooking,
  getOwnerStats,
};

export default bookingService;
