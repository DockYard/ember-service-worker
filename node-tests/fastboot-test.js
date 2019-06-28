const expect = require('chai').expect;
const denodeify = require('denodeify');
const request = denodeify(require('request'));
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

describe('Fastboot compatibility', function() {
  this.timeout(10000000);
  let app;

  before(function() {
    app = new AddonTestApp();

    return app.create('dummy', {
      fixturesPath: 'node-tests/fixtures',
      skipNpm: true
    })
      .then(() => {
        app.editPackageJSON(pkg => {
          pkg.devDependencies['ember-cli-fastboot'] = 'latest';
        });
        return app.run('npm', 'install');
      }).then(() => {
        return app.startServer({
          detectServerStart(output) {
            return output.indexOf('Serving on ') > -1;
          }
        });
      });
  });

  after(function() {
    return app.stopServer();
  });

  it('includes renders', () => {
    return request({
      url: 'http://localhost:49741',
      headers: {
        'Accept': 'text/html'
      }
    }).then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.contain('Congratulations, you made it!')
      expect(response.body).to.contain('<script src="/sw-registration.js"');
    });
  });
});
