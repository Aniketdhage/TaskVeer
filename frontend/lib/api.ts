import axios from 'axios';

const api = axios.create({
  baseURL: 'https://taskveer.onrender.com',
  // baseURL: 'http://localhost:5000/api',
  withCredentials: true, // send cookies with every request
});

export default api;
