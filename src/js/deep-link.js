const L = require('leaflet');
const querystring = require('query-string');
const camelCase = require('camel-case');

const emitter = require('./emitter');
const GLOBAL_BOUNDS = require('./bounds');

const stateToBounds = (state) => GLOBAL_BOUNDS[camelCase(state)];

const getBounds = (state) => {
  if (typeof state === 'string') emitter.emit('set:bounds', GLOBAL_BOUNDS[camelCase(state)]);
  if (Array.isArray(state)) {
    // ToDo: Error handling -- show a message if zoom doesn't work
    const stateBounds = state
      .map(stateToBounds)
      .reduce((bounds, val) => bounds.extend(val), L.latLngBounds());
    emitter.emit('set:bounds', stateBounds);
  }
  return false;
};

const processQueryString = (qs) => {
  const parsed = querystring.parse(qs);

  if (parsed.state) getBounds(parsed.state);
  if (parsed.query) emitter.emit('query', parsed.query);
  if (parsed.method) emitter.emit('method', parsed.searchMethod);
};

module.exports = {
  processQueryString,
};
