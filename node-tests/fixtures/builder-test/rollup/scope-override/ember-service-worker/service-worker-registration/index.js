if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('{{ROOT_URL}}{{SERVICE_WORKER_FILENAME}}', { scope: '{{SERVICE_WORKER_SCOPE}}' });
};
