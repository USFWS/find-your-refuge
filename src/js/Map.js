const L = require('leaflet');

const helpers = require('./helpers');
const emitter = require('./emitter');
const layers = require('./layers');
const icons = require('./icons');
const GLOBAL_BOUNDS = require('./bounds');

const emptyGeojson = {
  type: 'FeatureCollection',
  name: 'filtered',
  crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
  features: [],
};

const zoomOptions = {
  paddingTopLeft: [375, 50],
  paddingBottomRight: [50, 50]
};

const onEachFeature = (feat, layer) => {
  layer.bindPopup(`<h3>${feat.properties.OrgName}</h3>`);
  layer.on('mouseover', () => layer.openPopup());
  layer.on('mouseout', () => layer.closePopup());
  layer.on('click', () => emitter.emit('click:refuge', feat));
};

const Map = function (opts) {
  this.map = L.map('map', { zoomControl: false }).fitBounds(GLOBAL_BOUNDS.init);
  this.data = opts.data;

  this.filtered = L.geoJSON(emptyGeojson, {
    onEachFeature,
    pointToLayer: (feat, latlng) => L.marker(latlng, { icon: icons.orangeMarker }),
  }).addTo(this.map);

  this.markers = L.geoJSON(this.data, {
    onEachFeature,
    pointToLayer: (feat, latlng) => L.marker(latlng, { icon: icons.blueMarker }),
  }).addTo(this.map);

  layers.natGeo.addTo(this.map);
  layers.refuges.addTo(this.map);
  layers.amenities.addTo(this.map);

  L.control.layers(layers.basemaps, { 'Refuge boundaries': layers.refuges }).addTo(this.map);
  L.control.zoom({ position: 'topright' }).addTo(this.map);

  // Event listeners
  emitter.on('set:bounds', (bounds) => {
    if (L.latLngBounds(bounds).isValid()) this.map.fitBounds(bounds);
  });
  emitter.on('zoom:amenity', (coords) => {
    if (L.latLngBounds(coords).isValid()) this.map.flyTo(coords, 16, zoomOptions)
  });

  // emitter.on('zoom:refuge', (refuge) => {
  //   const coordinates = [...refuge.geometry.coordinates].reverse();
  //   this.map.flyTo(coordinates, 12, zoomOptions);
  // });

  // emitter.on('zoom:refugefeature', (refuge) => {
  //   const bounds = L.geoJSON(refuge).getBounds();
  //   this.map.flyToBounds(bounds, zoomOptions);
  // });

  emitter.on('render:results', (features) => {
    const bounds = helpers.featuresToBounds(features);
    this.filtered.clearLayers();
    this.filtered.addData({ ...emptyGeojson, features });
    this.map.fitBounds(bounds, {
      ...zoomOptions,
      maxZoom: 12,
    });
  });
};

module.exports = Map;
