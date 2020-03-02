const AMENITIES_URL = 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_National_Visitor_Service_Amenities_View/FeatureServer/0/query';

const getAmenitiesByOrgName = (orgName) => {
  const API_URL = `${AMENITIES_URL}?outFields=*&f=pgeojson&where=OrgName='${orgName}'`;
  return fetch(API_URL)
    .then((res) => res.json())
    .catch(console.log);
};

const getAmenityById = (id) => {
  const API_URL = `${AMENITIES_URL}?outFields=OrgName,Name&f=pgeojson&objectIds=${id}`;
  return fetch(API_URL)
    .then((res) => res.json())
    .then((res) => res.features[0].properties)
    .catch(console.log);
};

module.exports = {
  getAmenitiesByOrgName,
  getAmenityById
}