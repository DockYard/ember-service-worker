const SCOPE = '{{SERVICE_WORKER_SCOPE}}';
const ROOT_URL = '{{ROOT_URL}}';
let scopePassed = SCOPE !== 'undefined';
let scope = scopePassed ? SCOPE : ROOT_URL;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('{{ROOT_URL}}{{SERVICE_WORKER_FILENAME}}', { scope });
};
