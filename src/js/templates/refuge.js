const { getAmenityIcon } = require('../layers');

const createAmenityItem = (amenity) => {
  const icon = getAmenityIcon(amenity.properties.Category);
  const coords = [...amenity.geometry.coordinates].reverse();
  return `
    <li>
      <button class="zoom-to-amenity" data-coordinates="${JSON.stringify(coords)}" data-id="${amenity.id}">
        <img src="data:image/png;base64,${icon.symbol.imageData}" alt="${icon.label} icon" /> ${amenity.properties.Name}
      </button>
    </li>
  `
}

const refugeTemplate = (refuges) => {
  const props = refuges[0].properties;
  return `
    <li>
      <h3>${props.OrgName} in ${props.State_Name}</h3>
      <p><a href="${props.URL}" target="_blank">Visit us on the web</a></p>
      ${props.amenities.length ? `<h4>Amenities</h4>` : ''}
      <ul class="amenities-list">
        ${props.amenities.map(createAmenityItem).join('')}
      </ul>
    </li>
  `
};

module.exports = refugeTemplate;
