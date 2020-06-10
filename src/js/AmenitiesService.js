const { extentToLatLngBounds } = require('./helpers');

const AMENITIES_URL = 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_National_Visitor_Service_Amenities_View/FeatureServer/0/query';

const getAmenityByNameAndRefuge = (name, orgName) => {
  const API_URL = `${AMENITIES_URL}?outFields=*&f=pgeojson&where=OrgName='${encodeURIComponent(orgName)}'+AND+Name='${encodeURIComponent(name)}'`;
  return fetch(API_URL)
    .then((res) => res.json())
    .then((res) => res.features[0])
    .catch(console.log);
};

const getAmenitiesByOrgName = (orgName) => {
  const API_URL = `${AMENITIES_URL}?outFields=*&f=pgeojson&where=OrgName='${orgName}'`;
  return fetch(API_URL)
    .then((res) => res.json())
    .catch(console.log);
};

const getAmenitiesByCCCode = (ccCode) => {
  const API_URL = `${AMENITIES_URL}?outFields=*&f=pgeojson&where=CCCode='${ccCode}'`;
  return fetch(API_URL)
    .then((res) => res.json())
    .catch(console.log);
};

const getAmenityById = (id) => {
  const API_URL = `${AMENITIES_URL}?outFields=*&f=pgeojson&objectIds=${id}`;
  return fetch(API_URL)
    .then((res) => res.json())
    .then((res) => res.features[0])
    .catch(console.log);
};

const getAmenityBounds = (name, orgName) => {
  const API_URL = `${AMENITIES_URL}?f=pjson&outSR=4326&returnExtentOnly=true&where=OrgName='${encodeURIComponent(orgName)}'+AND+Name='${encodeURIComponent(name)}'`;
  return fetch(API_URL)
    .then((res) => res.json())
    .then(extentToLatLngBounds)
    .catch(console.log);
};

module.exports = {
  getAmenitiesByOrgName,
  getAmenitiesByCCCode,
  getAmenityById,
  getAmenityBounds,
  getAmenityByNameAndRefuge
}