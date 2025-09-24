import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL as string | undefined;

export const api = axios.create({
  baseURL: apiBaseUrl ?? 'http://localhost:5011',
  timeout: 8000,
});
