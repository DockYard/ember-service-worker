const SCOPE = '{{SERVICE_WORKER_SCOPE}}';
const ROOT_URL = '{{ROOT_URL}}';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('{{ROOT_URL}}{{SERVICE_WORKER_FILENAME}}', { scope: SCOPE || ROOT_URL });
};


