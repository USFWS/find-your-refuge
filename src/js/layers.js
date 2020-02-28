const L = require('leaflet');

const natGeo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
  maxZoom: 16,
});

const grayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
  maxZoom: 16,
});

const refuges = L.tileLayer.wms('https://gis.fws.gov/arcgis/services/FWS_Refuge_Boundaries/MapServer/WMSServer?', {
  layers: '0',
  opacity: 0.5,
  transparent: true,
  format: 'image/png',
  attribution: 'U.S. Fish and Wildlife Service',
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
};
