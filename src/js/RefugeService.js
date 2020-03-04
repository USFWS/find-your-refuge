const { extentToLatLngBounds } = require('./helpers');

const REFUGE_BOUNDARY_API = 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWSInterest_Simplified_Authoritative/FeatureServer/1/query';

let refugeData;

const setRefugeData = (geojson) => {
  refugeData = geojson;
};

const getRefugeByName = (name) => refugeData.features
  .find((refuge) => refuge.properties.OrgName.toLowerCase() === name.toLowerCase());

const getRefugeBoundsByName = (name) => {
  const API_URL = `${REFUGE_BOUNDARY_API}?f=pjson&returnExtentOnly=true&outSR=4326&where=ORGNAME='${name.toUpperCase()}'`;
  return fetch(API_URL)
    .then((res) => res.json())
    .then(extentToLatLngBounds)
    .catch(console.log);
}

module.exports = {
  setRefugeData,
  getRefugeByName,
  getRefugeBoundsByName
};
