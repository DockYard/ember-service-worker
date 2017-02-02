import { CONSTANT } from 'plugin-b/service-worker/constant';

self.addEventListener('fetch', function() {
  let x = CONSTANT + 1;
});
