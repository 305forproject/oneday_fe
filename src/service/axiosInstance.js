import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api", // 백엔드 주소
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
