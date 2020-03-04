const L = require('leaflet');
const querystring = require('query-string');
const camelCase = require('camel-case');

const { getRefugeBoundsByName, getRefugeByName } = require('./RefugeService');
const { getAmenityBounds } = require('./AmenitiesService');
const { titleCase } = require('./helpers');
const emitter = require('./emitter');
const GLOBAL_BOUNDS = require('./bounds');

const DeepLink = function (window) {
  this.history = window.history;
  this.window = window;

  this.window.addEventListener('popstate', this.historyHandler.bind(this));
  emitter.on('search:state', (e) => this.updateHistory({ type: 'query', method: 'state', data: e }));
  emitter.on('search:species', (e) => this.updateHistory({ type: 'query', method: 'species', data: e }));
  emitter.on('search:zipcode', (e) => this.updateHistory({ type: 'query', method: 'zipcode', data: e }));
  emitter.on('clear:query', (e) => this.updateHistory({ type: 'query', data: e }))

  // Click comes from a map, zoom comes from a button in the results
  emitter.on('click:refuge', (e) => this.updateHistory({ type: 'refuge', data: e.properties.OrgName }));
  emitter.on('zoom:refuge', (e) => this.updateHistory({ type: 'refuge', data: e.properties.OrgName }));
  emitter.on('zoom:refugefeature', (e) => this.updateHistory({ type: 'refuge', data: titleCase(e.properties.ORGNAME) }));
  emitter.on('select:amenity', (e) => this.updateHistory({ type: 'amenity', data: { amenity: e.Name, refuge: e.OrgName } }));

  this.processQueryString(window.location.search);
};

DeepLink.prototype.updateHistory = function (update) {
  let params = {
    ...querystring.parse(this.window.location.search),
    ...(update.method && { method: update.method }),
    ...(update.type === 'query' && update.query && { query: update.data }),
    ...(update.type === 'refuge' && { refuge: update.data }),
    ...(update.type === 'amenity' && { amenity: update.data.amenity, refuge: update.data.refuge }),
  }
  if (!params.query) delete params.query;
  if (update.type === 'refuge') delete params.amenity;
  const string = querystring.stringify(params).replace(/%20/g, '+');
  this.history.pushState(params, null, `${window.location.pathname}?${string}`);
}

DeepLink.prototype.historyHandler = function ({ state }) {
  if (!state) return;

  emitter.emit('update:search', {
    ...(state.query && { query: state.query }),
    ...(state.method && { method: state.method })
  });

  if (state.refuge && !state.amenity) getRefugeBoundsByName(state.refuge).then((bounds) => emitter.emit('set:bounds', bounds));
  if (state.refuge && state.amenity) getAmenityBounds(state.amenity, state.refuge).then((bounds) => emitter.emit('set:bounds', bounds));
};

DeepLink.prototype.stateToBounds = function (state) {
  return GLOBAL_BOUNDS[camelCase(state)] || false;
};

DeepLink.prototype.processQueryString = function (qs) {
  const parsed = querystring.parse(qs);

  if (parsed.state && !parsed.amenity && !parsed.refuge) emitter.emit('set:bounds', this.getBounds(parsed.state));
  if (parsed.refuge && !parsed.amenity) {
    // Similate a click on a refuge marker
    const refuge = getRefugeByName(parsed.refuge);
    emitter.emit('click:refuge', refuge);
    // getRefugeBoundsByName(parsed.refuge).then((bounds) => emitter.emit('set:bounds', bounds));
  }
  if (parsed.amenity) getAmenityBounds(parsed.amenity, parsed.refuge).then((bounds) => emitter.emit('set:bounds', bounds));

  const params = {};
  if (parsed.query) params.query = parsed.query;
  params.method = parsed.method ? parsed.method : 'refuge';

  emitter.emit('update:search', params);
};

DeepLink.prototype.getBounds = function (state) {
  if (typeof state === 'string') return GLOBAL_BOUNDS[camelCase(state)];
  if (Array.isArray(state)) {
    return state
      .map(this.stateToBounds)
      .filter(Boolean) // filters falsy values out
      .reduce((bounds, val) => bounds.extend(val), L.latLngBounds());
  }
  return false;
};

module.exports = DeepLink;
