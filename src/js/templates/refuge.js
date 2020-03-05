const { getAmenityIcon } = require('../icons');

const createAmenityItem = (amenity) => {
  const icon = getAmenityIcon(amenity.properties.Category);
  const coords = [...amenity.geometry.coordinates].reverse();
  return `
    <li>
      <button class="zoom-to-amenity" data-coordinates="${JSON.stringify(coords)}" data-id="${amenity.id}">
        <img src="${icon.dataUri}" alt="${icon.label} icon" /> ${amenity.properties.Name}
      </button>
    </li>
  `
}

const refugeTemplate = (refuges) => {
  const props = refuges[0].properties;
  console.log(props);
  return `
    <li>
      <h3>${props.OrgName} in ${props.State_Label}</h3>
      <p><a href="${props.UrlStation.replace('http', 'https')}" target="_blank">Visit us on the web</a></p>
      ${props.amenities.length ? `<h4>Amenities</h4>` : ''}
      <ul class="amenities-list">
        ${props.amenities.map(createAmenityItem).join('')}
      </ul>
    </li>
  `
};

module.exports = refugeTemplate;
