import axios from "axios";

const http = axios.create({
  baseURL: "/api", // Ensure correct base URL
  headers: { "Content-Type": "application/json" },
});

export default http;
