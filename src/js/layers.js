const L = require('leaflet');
const esri = require('esri-leaflet');
require('esri-leaflet-renderers');

const emitter = require('./emitter');
const { titleCase } = require('./helpers');

const natGeo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
  maxZoom: 16,
});

const grayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
  maxZoom: 16,
});

const refuges = esri.featureLayer({
  url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWSInterest_Simplified_Authoritative/FeatureServer/1',
  minZoom: 11,
  attribution: 'U.S. Fish and Wildlife Service',
  where: `INTTYPE1 NOT IN ('E', 'A')`,
  onEachFeature: (feature, layer) => {
    layer.bindPopup(`<p>${titleCase(feature.properties.ORGNAME)}</p>`)
    layer.on('click', () => emitter.emit('zoom:refugefeature', feature))
  }
});

const wilderness = esri.featureLayer({
  url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWSWilderness/FeatureServer/2',
  minZoom: 5,
  onEachFeature: (feature, layer) => layer.bindPopup(`<p>${titleCase(feature.properties.DESNAME)}</p>`)
});

const amenities = esri.featureLayer({
  url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_National_Visitor_Service_Amenities_View/FeatureServer/0',
  minZoom: 11,
  where: "Public_Use = 'Public Use'",
  onEachFeature: (feature, layer) => {
    layer.bindPopup(`<p>${feature.properties.Name}</p>`)
    layer.on('click', (e) => {
      // Analytics event
      emitter.emit('select:amenity', feature);
    })
  },
});

const basemaps = {
  'National Geographic': natGeo,
  'Gray Canvas': grayCanvas,
};

module.exports = {
  natGeo,
  grayCanvas,
  refuges,
  basemaps,
  amenities,
  wilderness
};
