import axios from "axios";

const http = axios.create({
  baseURL: "/api", // Ensure correct base URL
  headers: { "Content-Type": "application/json" },
});

// flattens the layer of nested introduced by axios
// the responses look like { data, error }, but axios nests the whole response under 'data'
http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const error = {
      ...err.response.data.error,
      ...err,
    };

    // console.error(error);
    return Promise.reject(error);
  }
);

export default http;
