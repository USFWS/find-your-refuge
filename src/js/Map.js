const L = require('leaflet');
const esri = require('esri-leaflet');
require('esri-leaflet-renderers');

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

const onEachFeature = (feat, layer) => {
  const props = feat.properties;
  layer.bindPopup(`<p><strong><a href="${props.URL}">${props.OrgName}</a></strong></p>`);
  layer.on('mouseover', () => layer.openPopup());
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

  L.control.layers(layers.basemaps, { 'Refuge boundaries': layers.refuges }).addTo(this.map);
  L.control.zoom({ position: 'topright' }).addTo(this.map);

  // Add amenities layer
  esri.featureLayer({
    url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_National_Visitor_Service_Amenities_View/FeatureServer/0',
    minZoom: 12,
    onEachFeature: (feature, layer) => layer.bindPopup(`<p>${feature.properties.Name}</p>`),
  }).addTo(this.map);

  // Event listeners
  //  - Change basemap
  emitter.on('set:bounds', (bounds) => this.map.fitBounds(bounds));
  emitter.on('zoom:refuge', (refuge) => {
    const coordinates = [...refuge.geometry.coordinates].reverse();
    this.map.flyTo(coordinates, 12, {
      paddingTopLeft: [375, 50],
      paddingBottomRight: [50, 50],
    });
  });
  emitter.on('render:results', (features) => {
    const bounds = helpers.featuresToBounds(features);
    this.filtered.clearLayers();
    this.filtered.addData({ ...emptyGeojson, features });
    this.map.fitBounds(bounds, {
      paddingTopLeft: [375, 50],
      paddingBottomRight: [50, 50],
      maxZoom: 12,
    });
  });
};

module.exports = Map;
