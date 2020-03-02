const L = require('leaflet');
const esri = require('esri-leaflet');
require('esri-leaflet-renderers');

const emitter = require('./emitter');

let amenityIcons = [];

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
  onEachFeature: (feature, layer) => layer.on('click', () => emitter.emit('zoom:refugefeature', feature))
});

const amenities = esri.featureLayer({
  url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_National_Visitor_Service_Amenities_View/FeatureServer/0',
  minZoom: 11,
  onEachFeature: (feature, layer) => {
    layer.bindPopup(`<p>${feature.properties.Name}</p>`)
    layer.on('click', (e) => {
      // Analytics event
      emitter.emit('select:amenity', {
        OrgName: e.target.feature.properties.OrgName,
        Name: e.target.feature.properties.Name
      });
      emitter.emit('zoom:amenity', [...e.target.feature.geometry.coordinates].reverse());
    })
  },
});

const getAmenityIcons = () => amenityIcons;

const getAmenityIcon = (category) => amenityIcons.find((icon) => icon.value === category);

amenities.metadata((err, metadata) => {
  if (err) console.log(err);
  amenityIcons = metadata.drawingInfo.renderer.uniqueValueInfos;
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
  getAmenityIcons,
  getAmenityIcon
};
