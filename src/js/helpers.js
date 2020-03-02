const L = require('leaflet');
const unique = require('array-unique').immutable;

const sortByName = (a, b) => {
  const aName = a.properties.OrgName.toUpperCase();
  const bName = b.properties.OrgName.toUpperCase();
  if (aName < bName) return -1;
  if (aName > bName) return 1;
  return 0;
};

const getIconPath = (type) => {
  switch (type) {
    case '':
      return 'blue-goose.svg';
    case 'NWR':
      return 'blue-goose.svg';
    case 'RAO':
      return 'blue-goose.svg';
    case 'WMD':
      return 'blue-goose.svg';
    case 'AFF':
      return 'fisheries.svg';
    case 'HNFH':
      return 'fisheries.svg';
    case 'NFH':
      return 'fisheries.svg';
    case 'CTC':
      return 'fisheries.svg';
    case 'FHC':
      return 'fisheries.svg';
    case 'FTC':
      return 'fisheries.svg';
    case 'NFHTC':
      return 'fisheries.svg';
    default:
      return 'blue-goose.svg';
  }
};

const findRefugeByName = (name, data) => data.find((r) => r.properties.OrgName.toLowerCase() === name.toLowerCase());

const featuresToBounds = (features) => features.reduce(
  (bounds, feature) => {
    const coordinates = [...feature.geometry.coordinates];
    return bounds.extend(coordinates.reverse());
  },
  new L.latLngBounds(),
);

const titleCase = (str) => {
  return str.toLowerCase().split(' ').map(function (word) {
    return word.replace(word[0], word[0].toUpperCase());
  }).join(' ');
}

module.exports = {
  sortByName,
  getIconPath,
  featuresToBounds,
  findRefugeByName,
  unique,
  titleCase
};
