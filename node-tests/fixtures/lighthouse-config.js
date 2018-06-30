module.exports = {
  "settings": {},
  "passes": [{
    "passName": "defaultPass",
    "recordNetwork": true,
    "recordTrace": true,
    "pauseBeforeTraceEndMs": 5000,
    "useThrottling": true,
    "gatherers": [
      "url"
    ]
  },
  {
    "passName": "offlinePass",
    "recordNetwork": true,
    "useThrottling": false,
    "gatherers": [
      "service-worker",
      "offline"
    ]
  }],

  "audits": [
    "service-worker",
  ],

  "aggregations": [{
    "name": "Progressive Web App",
    "id": "pwa",
    "description": "These audits validate the aspects of a Progressive Web App. They are a subset of the [PWA Checklist](https://developers.google.com/web/progressive-web-apps/checklist).",
    "scored": true,
    "categorizable": true,
    "items": [{
      "name": "App can load on offline/flaky connections",
      "description": "Ensuring your web app can respond when the network connection is unavailable or flaky is critical to providing your users a good experience. This is achieved through use of a [Service Worker](https://developers.google.com/web/fundamentals/primers/service-worker/).",
      "audits": {
        "service-worker": {
          "expectedValue": true,
          "weight": 1
        }
      }
    }]
  }],
  "categories": {
    "pwa": {
      "name": "Progressive Web App",
      "weight": 1,
      "description": "These audits validate the aspects of a Progressive Web App. They are a subset of the [PWA Checklist](https://developers.google.com/web/progressive-web-apps/checklist).",
      "audits": [
        {"id": "service-worker", "weight": 1},
      ]
    }
  }
}
