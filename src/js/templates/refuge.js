const refugeTemplate = (refuges) => {
  const props = refuges[0].properties;
  console.log(props);
  return `
    <li>
      <h3>${props.OrgName} in ${props.State_Name}</h3>
      <a href="${props.URL}" target="_blank">
        <svg><use xlink:href="#world"></use></svg>
      </a>
    </li>
  `
};

module.exports = refugeTemplate;
