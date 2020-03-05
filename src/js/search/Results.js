const L = require('leaflet');
const leafletKnn = require('leaflet-knn');

const emitter = require('../emitter');
const { findRefugeByName, sortByName, fiveDigitNumberRegex } = require('../helpers');
const { getZipCode } = require('../ZipcodeService');
const { getAmenitiesByOrgName, getAmenityById } = require('../AmenitiesService');

const officeList = require('../templates/office-list');
const refuge = require('../templates/refuge');

const templates = {
  officeList,
  refuge
};

const Results = function (opts) {
  this.data = opts.data.features;
  this.select = opts.select;
  this.textInput = opts.textInput;
  this.list = opts.list;
  this.message = opts.message;
  this.length = opts.length;
  this.loading = opts.loading;
  this.toggle = opts.toggleResults;

  // Analytics events
  this.select.addEventListener('change', (e) => emitter.emit('select:state', e.target.value));

  const getAndRenderAmenities = (refuge, cancelZoomToFeatures) => {
    const props = refuge.properties;
    getAmenitiesByOrgName(props.OrgName)
      .then((amenities) => {
        // Add ameninty data to refuge geojson
        const data = {
          ...refuge,
          properties: {
            ...props,
            amenities: [
              ...amenities.features
            ]
          }
        };
        this.empty();
        this.render([data], templates.refuge, cancelZoomToFeatures);
      });
  }

  // Sets the value of the appropriate input based on an updated query parameter
  emitter.on('update:search', ({ method, query = '' }) => {
    const input = this.getInput(method);
    if (input) input.value = query;
    if (method === 'state') this.searchState(query);
    if (method === 'zipcode') this.searchZipcode(query);
    if (method === 'refuge') this.searchFacility(query);
  });

  // Clicked on refuge on the map
  emitter.on('click:refuge', (refuge) => getAndRenderAmenities(refuge));

  // Clicked on refuge in search results
  emitter.on('zoom:refuge', (refuge) => getAndRenderAmenities(refuge));

  // Clicked on simplified refuge boundary feature layer
  emitter.on('zoom:refugefeature', (feature) => {
    const refuge = findRefugeByName(feature.properties.ORGNAME, this.data);
    getAndRenderAmenities(refuge);
  });

  emitter.on('select:amenity', (amenity) => {
    const refuge = findRefugeByName(amenity.properties.OrgName, this.data);
    getAndRenderAmenities(refuge, true);
  });

  emitter.on('search:refuge', (query) => {
    const results = this.find(query);
    this.empty();
    this.message.innerHTML = 'Enter a refuge name or state.';
    this.select.parentNode.setAttribute('aria-hidden', 'true');
    this.textInput.parentNode.setAttribute('aria-hidden', 'false');
    if (!results) return;
    this.render(results, templates.officeList);
  });

  emitter.on('search:zipcode', (zipcode) => {
    this.empty();
    this.message.innerHTML = 'Please enter a five-digit zip code.';
    this.select.parentNode.setAttribute('aria-hidden', 'true');
    this.textInput.parentNode.setAttribute('aria-hidden', 'false');
    this.nearest(zipcode);
  });

  emitter.on('search:state', (query) => {
    this.empty();
    const results = this.findByState(query);
    this.select.parentNode.setAttribute('aria-hidden', 'false');
    this.textInput.parentNode.setAttribute('aria-hidden', 'true');
    this.render(results, templates.officeList);
  });

  this.list.addEventListener('click', this.handleResultClick.bind(this));
  this.toggle.addEventListener('click', this.toggleResults.bind(this));
};

Results.prototype.activateInput = function (input) {
  this.empty();
  [this.textInput, this.select].forEach((i) => i.parentNode.setAttribute('aria-hidden', 'true'));
  input.parentNode.setAttribute('aria-hidden', 'false');
};

Results.prototype.searchFacility = function (query) {
  const results = this.find(query);
  this.activateInput(this.textInput);
  this.message.innerHTML = 'Search by station name or state';
  if (!results) return;
  this.render(results.sort(sortByName), templates.officeList);
}

Results.prototype.searchZipcode = function (zipcode) {
  this.activateInput(this.textInput);
  this.nearest(zipcode);
}

Results.prototype.searchState = function (query) {
  this.loading.setAttribute('aria-hidden', 'false');
  const results = this.findByState(query);
  this.activateInput(this.select);
  this.render(results.sort(sortByName), templates.officeList);
}

Results.prototype.findByState = function (query) {
  return this.data.filter(({ properties: props }) => 
    props.State_Name ? props.State_Name.toLowerCase() === query.toLowerCase() : false);
};

Results.prototype.toggleResults = function () {
  if (this.list.classList.contains('closed')) {
    this.list.classList.remove('closed');
    this.toggle.textContent = 'Hide results';
  } else {
    this.list.classList.add('closed');
    this.toggle.textContent = 'Show results';
  }
};

Results.prototype.empty = function () {
  this.list.innerHTML = '';
  this.length.innerHTML = '';
  this.message.innerHTML = '';
};

Results.prototype.handleResultClick = function (e) {
  if (e.target.className === 'zoom-to-refuge') {
    const facilityName = e.target.getAttribute('data-orgname');
    const refuge = findRefugeByName(facilityName, this.data);
    emitter.emit('zoom:refuge', refuge);
  }

  if (e.target.className === 'zoom-to-amenity') {
    getAmenityById(e.target.getAttribute('data-id'))
      .then((amenity) => emitter.emit('select:amenity', amenity));
  }
};

Results.prototype.updateLength = function (n = 0) {
  const plural = n === 1 ? '' : 's';
  this.length.innerHTML = `Showing ${n} result${plural}`;
};

Results.prototype.find = function (query) {
  const regex = new RegExp(query, 'gi');
  if (query.length === 0) return this.render([]);

  return this.data.filter(({ properties: props }) => {
    const isState = regex.test(props.State_Name);
    const isRegion = regex.test(props.FWSRegion);
    const isName = regex.test(props.OrgName);
    const isLabel = regex.test(props.label);
    return (isState || isRegion || isName || isLabel);
  });
};

Results.prototype.render = function (results, template, cancelZoomToFeatures) {
  if (!results.length) {
    this.list.innerHTML = '';
    this.toggle.setAttribute('aria-hidden', 'true');
    return false;
  }

  this.list.innerHTML = template(results);
  this.updateLength(results.length);
  this.toggle.setAttribute('aria-hidden', 'false');
  this.loading.setAttribute('aria-hidden', 'true');
  if (!cancelZoomToFeatures) emitter.emit('render:results', results);
};

Results.prototype.nearest = function (zipcode) {
  if (!fiveDigitNumberRegex.test(zipcode)) {
    this.message.innerHTML = 'You must provide a valid five-digit zip code.';
    return false;
  }
  this.message.innerHTML = '';

  const findNearest = (geometry) => {
    if (!geometry) return false;
    return this.index.nearest(geometry, 10);
  };

  const findAndDisplayNearestOffices = (zip) => {
    const nearestOffices = findNearest(zip);
    if (nearestOffices) {
      const features = nearestOffices.map((o) => o.layer.feature);
      this.render(features, templates.officeList);
    }
  };

  this.index = leafletKnn(L.geoJSON(this.data));
  this.message.innerHTML = 'Loading zipcode data...';
  this.loading.setAttribute('aria-hidden', 'false');
  getZipCode(zipcode)
    .then((geojson) => {
      const { coordinates } = geojson.features[0].geometry;
      this.message.innerHTML = '';
      this.loading.setAttribute('aria-hidden', 'true');
      findAndDisplayNearestOffices([...coordinates]);
      emitter.emit('found:zipcode', geojson);
    })
    .catch(() => { 
      this.loading.setAttribute('aria-hidden', 'true');
      this.message.innerHTML = 'The number you entered did not match an existing zipcode.';
    });
};

Results.prototype.getInput = function (state) {
  switch (state) {
    case 'state':
      return this.select;
    case 'zipcode':
      return this.textInput;
    case 'refuge':
      return this.textInput;
    default:
      return false;
  };
};

module.exports = Results;
