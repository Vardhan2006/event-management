import API from "./api";

export async function registerData(data) {
  const response = await API.post("/auth/register", data);
  return response.data;
}

export async function loginData(data) {
  const response = await API.post("/auth/login", data);
  return response.data;
}

export async function getMe() {
  const response = await API.get("/auth/me");
  return response.data;
}

const authService = {
  register: registerData,
  login: loginData,
  getMe,
};

export default authService;
