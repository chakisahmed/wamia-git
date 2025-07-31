import axios from 'axios';

import { notify } from '../utils/notificationServices';
import { t } from 'i18next';
import { consoleLog } from '../utils/helpers';
const axiosInstance = axios.create({
  baseURL: 'https://www.wamia.tn',
  
  headers: {
    'Content-Type': 'application/json',
  },
  signal:undefined,
  timeout: 35_000,               // <-- abort any request over 35 seconds
});

// (your existing interceptors remain unchanged)
axiosInstance.interceptors.request.use(config => {
  config.metadata = { startTime: Date.now() };
  return config;
}, error => Promise.reject(error));

axiosInstance.interceptors.response.use(response => {
  const duration = Date.now() - response.config.metadata.startTime;
  consoleLog(`Request to ${response.config.url} took ${duration} ms`);
  return response;
}, error => {
  // note: if you hit a timeout, error.code === 'ECONNABORTED'
  const duration = Date.now() - (error.config?.metadata?.startTime || 0);
  consoleLog(`Request to ${error.config?.url} took ${duration} ms`);
  if (error.code === 'ECONNABORTED') {
    notify(t('request_timeout'))
    return Promise.reject(new Error('Request timed out. Please try again.'));
  }
  return Promise.reject(error);
});

export default axiosInstance;
