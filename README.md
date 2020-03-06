## Find your Refuge

This web mapping application is designed to help citizens find National Wildlife Refuges all over the country and U.S. territories.

## Deep linking

By manipulating the URL you can link to specific configurations of the map so the user doesn't have to follow a series of steps to find a point of interest. This is particularly helpful when linking to the map from webpages or social media posts. Below are a list of configurable query parameters that you can combine to initialize the map exactly how you want.

The map's URL is automatically updated when the user interacts either with map icons or the search interface. If it feels more comfortable, you can build the URL by finding the location on the map then copying the link rather than writing the link yourself. 

If you find a bug in any of the deep linking functionality, [file an issue](https://github.com/USFWS/find-your-refuge/issues/new) or contact [roy_hewitt@fws.gov](mailto:roy_hewitt@fws.gov).

**Note: query parameters are not case sensitive.**

### Query

Query sets the search criteria for the map. This will work for any search method (by name, by Zip Code, by state). **Default value: empty string.**

`/find-a-wildlife-refuge/?query=Alabama`

### Method

Initializes the map with a specific search method pre-selected. **Default value: search by refuge.**

Possible values: `refuge`, `state`, `zipcode`.

`/find-a-wildlife-refuge/?method=state`

### State

Initializes the map's geographic extent over a specific state or states. States with two words should include a plus sign (`+`) instead of a space. If you include a refuge/amenity the state value will be ignored. **By default, the map initializes over the Continental United States.**

Supports all 50 states and territories including `u.s.+minor+outlying+islands`, `puerto+rico`, `virgin+islands`.

`/find-a-wildlife-refuge/?state=north+carolina`
`/find-a-wildlife-refuge/?state=u.s.+minor+outlying+islands`
`/find-a-wildlife-refuge/?state=maryland&state=delaware&state=virginia`

### Refuge

Initializes the map's geographic extent over a specific refuge. Name must be an exact match. If you provide both a refuge and an amenity the map will initialize over the amenity instead. **Default value: none.**

`/find-a-wildlife-refuge/?refuge=Blackwater+National+Wildlife+Refuge`

### Amenity

Initializes the map's geographic extent over a specific amenity. Since amenity names are not unique you must provide both a refuge and an amenity. Name must be an exact match. **Default value: none.**

`/find-a-wildlife-refuge/?amenity=Shorters+Warf+Public+Boat+Ramp&refuge=Blackwater+National+Wildlife+Refuge`

### Combining query parameters

By combinging the different options above you can start the map just about anywhere for your specific use case.

#### Search for a specific zipcode

`/find-a-wildlife-refuge/?query=21401&method=zipcode`

### Search for a specific state

`/find-a-wildlife-refuge/?query=alabame&method=state`

### Development

- Install all of the dependencies with `npm i`.
- `npm start` for a development server
- `npm build` for a production ready build

### License

As a work of the United States Government, this project is in the public domain within the United States.

Additionally, we waive copyright and related rights in the work worldwide through the CC0 1.0 Universal public domain dedication.

Check out [the license](https://github.com/USFWS/find-your-refuge/blob/master/LICENSE.md).