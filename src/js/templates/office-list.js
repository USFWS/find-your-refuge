const createListItem = ({ properties: props }) => `
  <li>
    <button class="zoom-to-refuge" data-orgname="${props.OrgName}">
      <svg class="orange-marker">
        <use xlink:href="#orange"></use>
      </svg>

      <div class="facility-info">
        <p class="facility-name">${props.OrgName}</p>
        <p class="facility-location">${props.State_Array.join(', ')}</p>
      </div>
    </button>
  </li>
`;

const template = (offices) => `
  <ul class="search-results">
    ${offices.map(createListItem).join('')}
  </ul>
`;

module.exports = template;
