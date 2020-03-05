const helpers = require('./helpers');
const Map = require('./Map');
const Search = require('./search/Search');
const Results = require('./search/Results');
const DeepLink = require('./deep-link');
const rs = require('./RefugeService');
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

const addOptionsToSelect = (values, select) => {
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.text = value;
    select.add(option);
  });
};

// Start the app
const init = () => {
  const API_URL = 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_NWRS_HQ_HuntFishStation/FeatureServer/0/query?where=1+%3D+1&outFields=*&f=pgeojson';

  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      const geodata = { ...data, features: data.features.map(helpers.updateFeatureStateName) };
      const states = helpers.flatten(geodata.features
        .map((f) => f.properties.State_Array))
        .filter((s) => s);
      addOptionsToSelect(helpers.getUniqueStates(states).sort(), select);
      rs.setRefugeData(data);
      const geojson = { ...geodata };
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
      new DeepLink(window);
    });
};

init();
document.documentElement.classList.remove('no-js');
form.addEventListener('submit', (e) => e.preventDefault());
