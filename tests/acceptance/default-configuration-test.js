import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | default configuration', function(hooks) {
  setupApplicationTest(hooks);

  test('sw-registration is loaded as a script.', async function(assert) {
    await visit('/');

    assert.ok(document.querySelector('script[src="/sw-registration.js"]'));
  });
});
