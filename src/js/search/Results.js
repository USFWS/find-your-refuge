const L = require('leaflet');
const leafletKnn = require('leaflet-knn');
const closest = require('closest');

const emitter = require('../emitter');
const helpers = require('../helpers');

const officeListByState = require('../templates/office-list-by-state');
const officeList = require('../templates/office-list');

const templates = {
  officeListByState,
  officeList,
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

  emitter.on('search:refuge', (query) => {
    const results = this.find(query);
    this.empty();
    this.message.innerHTML = 'Enter a refuge name or state.';
    this.select.parentNode.setAttribute('aria-hidden', 'true');
    this.textInput.parentNode.setAttribute('aria-hidden', 'false');
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
    const results = this.find(query);
    this.select.parentNode.setAttribute('aria-hidden', 'false');
    this.textInput.parentNode.setAttribute('aria-hidden', 'true');
    this.render(results, templates.officeList);
  });

  this.list.addEventListener('click', this.handleResultClick.bind(this));
  this.toggle.addEventListener('click', this.toggleResults.bind(this));
};

Results.prototype.open = function () {
  this.list.classlist.remove('closed');
};

Results.prototype.close = function () {
  this.list.classlist.add('closed');
};

Results.prototype.toggleResults = function () {
  this.list.classList.toggle('closed');
};

Results.prototype.empty = function () {
  this.list.innerHTML = '';
  this.length.innerHTML = '';
  this.message.innerHTML = '';
};

Results.prototype.handleResultClick = function (e) {
  if (e.target.className === 'facility-icon') {
    const facilityName = closest(e.target, '.facility-info').querySelector('.facility-name').textContent;
    const refuge = helpers.findRefugeByName(facilityName, this.data);
    emitter.emit('zoom:refuge', refuge);
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

Results.prototype.render = function (results, template) {
  if (!results || !results.length) {
    this.list.innerHTML = '';
    this.toggle.setAttribute('aria-hidden', 'true');
    return false;
  }

  this.list.innerHTML = template(results);
  this.updateLength(results.length);
  this.toggle.setAttribute('aria-hidden', 'false');
  emitter.emit('render:results', results);
};

Results.prototype.nearest = function (zipcode) {
  if (zipcode.length !== 5) {
    this.message.innerHTML = 'You must provide a valid five-digit zip code.';
    return false;
  }
  this.message.innerHTML = '';

  const findNearest = () => {
    const userZipcode = this.zipcodes.features
      .filter((zip) => zip.properties.GEOID10 === zipcode);

    if (!userZipcode.length) {
      this.message.innerHTML = 'The number you entered did not match an existing zipcode.';
      return false;
    }
    return this.index.nearest(userZipcode[0].geometry.coordinates, 10);
  };

  const mapOfficesToFeatures = (nearestOffices) => nearestOffices.map((o) => o.layer.feature);

  const findAndDisplayNearestOffices = (zip) => {
    const nearestOffices = findNearest(zip);
    if (nearestOffices) {
      const features = mapOfficesToFeatures(nearestOffices);
      this.render(features, templates.officeList);
    }
  };

  if (!this.zipcodes) {
    const indexData = L.geoJSON(this.data);
    console.log(indexData instanceof L.GeoJSON);
    this.index = leafletKnn(indexData);
    this.message.innerHTML = 'Loading zipcode data...';
    this.loading.setAttribute('aria-hidden', 'false');
    fetch('./data/zip-centroids.js')
      .then((res) => res.json())
      .then((zipcodes) => {
        this.message.innerHTML = '';
        this.loading.setAttribute('aria-hidden', 'true');
        this.zipcodes = zipcodes;
        findAndDisplayNearestOffices(zipcode);
      });
  } else {
    findAndDisplayNearestOffices(zipcode);
  }
};

module.exports = Results;
