const helpers = require('./helpers');
const Map = require('./Map');
const Search = require('./search/Search');
const Results = require('./search/Results');
const deepLink = require('./deep-link');
require('./analytics');

const searchPanel = document.querySelector('.search-panel');
const form = searchPanel.querySelector('.search-form');
const input = searchPanel.querySelector('input[type=search]');
const list = searchPanel.querySelector('ul');
const radios = searchPanel.querySelectorAll('input[type=radio]');
const select = searchPanel.querySelector('select');
const message = searchPanel.querySelector('.message');
const length = searchPanel.querySelector('.search-results-length');
const loading = searchPanel.querySelector('.loading');
const toggleResults = searchPanel.querySelector('.toggle-results');

const addOptionToSelect = (value, select) => {
  const option = document.createElement('option');
  option.value = value;
  option.text = value;
  select.add(option);
};

// Start the app
const init = () => {
  // const API_URL = 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/FWS_HQ_Visitor_Services/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson';
  // const API_URL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWS_National_Visitor_Service_Amenities_View/FeatureServer/0/query?where=Category='11'&outFields=*&outSR=4326&f=geojson";
  const API_URL = 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/CMT_NWRs_WMDs/FeatureServer/0/query?where=1+%3D+1&outFields=State_Name%2COrgName%2CURL%2Clabel&returnGeometry=true&f=pgeojson&token=';

  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      const uniqueStates = helpers.unique(data.features
        .map((f) => f.properties.State_Name))
        .filter((state) => state !== ' ')
        .sort();
      uniqueStates.forEach((state) => addOptionToSelect(state, select));
      const geojson = { ...data };
      const map = new Map({ data: geojson });
      const search = new Search({
        input,
        select,
        radios: Array.prototype.slice.call(radios),
      });
      const results = new Results({
        list,
        textInput: input,
        data: geojson,
        select,
        message,
        length,
        loading,
        toggleResults,
      });
      deepLink.processQueryString(window.location.search);
    });
};

init();
document.documentElement.classList.remove('no-js');
form.addEventListener('submit', (e) => e.preventDefault());
