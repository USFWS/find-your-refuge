const helpers = require('../helpers');

const createListItem = ({ properties: props }) => `
  <li>
    <img src="./images/blue-goose.svg" alt=""/>
    <div class="facility-info">
      <p class="facility-name">${props.OrgName}</p>
      <p class="facility-location">${props.State_Name}</p>
    </div>
  </li>
`
  // <li>
  //   <img src="./images/${helpers.getIconPath(props.RSL_TYPE)}" alt=""/>
  //   <div class="facility-info">
  //     <p class="facility-name">${props.Name}</p>
  //     <p class="facility-location">${props.CITY}, ${props.STATE}</p>
  //   </div>
  // </li>
  ;

const template = (state, offices) => `
  <li>
    <h2>${state}</h2>
    <ul>${offices.map(createListItem).join('')}</ul>
  </li>
`;

const getUniqueStates = (offices) => offices
  .map((o) => o.properties.State_Name)
  .filter((val, i, self) => self.indexOf(val) === i);

const officeListByState = (offices) => {
  const states = getUniqueStates(offices).sort();

  return states.map((state) => {
    const filtered = offices
      .filter((office) => office.properties.State_Name === state)
      .sort(helpers.sortByName);
    return template(state, filtered);
  }).join('');
};

module.exports = officeListByState;
