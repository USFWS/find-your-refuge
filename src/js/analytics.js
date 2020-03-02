const analytics = window.gtag;
const emitter = require('./emitter');
const { titleCase } = require('./helpers');

// Google Custom Events (https://developers.google.com/analytics/devguides/collection/gtagjs/events)
// gtag('event', <action>, { 'event_category': <category>, 'event_label': <label>, 'value': <value> });

const app = 'Find Your Refuge';

// Entered search term (2.5 seconds after they finish typing)
emitter.on('search:term', ({ query, type }) => {
  if (type === 'zipcode') {
    analytics('event', 'search:zipcode', {
      event_label: query,
      event_category: app
    });
  } else {
    analytics('event', 'search:query', {
      event_label: query,
      event_category: app
    });
  }
});

// Selected state from dropdown
emitter.on('select:state', (state) => {
  analytics('event', 'search:state', {
    event_label: state,
    event_category: app
  });
});

// Selected refuge from sidebar
emitter.on('zoom:refuge', (refuge) => {
  analytics('event', 'zoom:refuge', {
    event_label: refuge.properties.OrgName,
    event_category: app
  });
});

// Selected refuge point from map
emitter.on('click:refuge', (refuge) => {
  analytics('event', 'click:refuge', {
    event_label: refuge[0].properties.OrgName,
    event_category: app
  });
});

// Selected refuge polygon from map
emitter.on('zoom:refugefeature', (refuge) => {
  analytics('event', 'click:refuge', {
    event_label: titleCase(refuge.properties.ORGNAME),
    event_category: app
  });
});

// Toggled results
emitter.on('toggle:results', (status) => analytics('event', 'toggle:results', {
  event_label: status,
  event_category: app
}));
