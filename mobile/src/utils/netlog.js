/* eslint-disable no-console */
import axios from 'axios';

(function installFetchLogger(){
  if (global.__FETCH_LOGGER_INSTALLED__) return;
  global.__FETCH_LOGGER_INSTALLED__ = true;
  const origFetch = global.fetch;
  global.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url;
    const method = (init?.method || 'GET').toUpperCase();
    const started = Date.now();
    try {
      const res = await origFetch(input, init);
      const ms = Date.now() - started;
      const sizeHint = Number(res.headers?.get?.('content-length')) || undefined;
      console.log(`[fetch] ${method} ${url} -> ${res.status} in ${ms}ms ${sizeHint ? `(${sizeHint}b)` : ''}`);
      return res;
    } catch (err) {
      const ms = Date.now() - started;
      console.log(`[fetch] ${method} ${url} -> ERROR in ${ms}ms`, err?.message || err);
      throw err;
    }
  };
})();

(function installAxiosLogger(){
  axios.interceptors.request.use((config) => {
    config.metadata = { started: Date.now() };
    const m = (config.method || 'get').toUpperCase();
    console.log(`[axios] ${m} ${config.baseURL || ''}${config.url}`);
    return config;
  });
  axios.interceptors.response.use(
    (response) => {
      const ms = Date.now() - (response.config.metadata?.started || Date.now());
      const len = Number(response.headers?.['content-length']) || undefined;
      const m = (response.config.method || 'get').toUpperCase();
      console.log(`[axios] ${m} ${response.config.baseURL || ''}${response.config.url} -> ${response.status} in ${ms}ms ${len ? `(${len}b)` : ''}`);
      return response;
    },
    (error) => {
      const cfg = error.config || {};
      const ms = Date.now() - (cfg.metadata?.started || Date.now());
      const m = (cfg.method || 'get').toUpperCase();
      const url = `${cfg.baseURL || ''}${cfg.url || ''}`;
      const status = error.response?.status;
      console.log(`[axios] ${m} ${url} -> ERROR ${status || ''} in ${ms}ms`, error.message);
      return Promise.reject(error);
    }
  );
})();
