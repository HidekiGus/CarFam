import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : `http://${window.location.hostname}:3001/api`,
});

export default api;
