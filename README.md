**geojson_tilebuilder** provides a way to draw inside a tile points, heatmaps and square heatmaps based on the same data type. 

### What can you do
- Is possible to draw geoJSON data as points: 
![Points](https://github.com/nicosanti98/geojson_tiledrawer/blob/main/images/pallini.png "apap")
- Is possible to draw geoJSON data as heatmap: 
![Heatmap](https://github.com/nicosanti98/geojson_tiledrawer/blob/main/images/hetamap.png "Heatmap")
- And also geoJSON data as square heatmap: 
![Square Heatmap](https://github.com/nicosanti98/geojson_tiledrawer/blob/main/images/squareheatmap.png "Square Heatmap")

**All these images are from [SmartRoadSense](https://www.smartroadsense.it "SmartRoadSense") frontend*.


Points and heatmap references directly to geogrphical data: for each element in data the library draws a point or an heatmap. 
As regards square heatmap, instead, the library draws a prefixed number of squares inside a tiles. Every square color is based on the average of "points value" inside the square area. 

The power of the library is that with the same data types you can select different ways to represent them in the same tiles, rather then use different types in different libraries.

### Prerequisites
To use the library as tile drawer and to overlay it in a map in order to represent geographical data, is necessary to use a map, like [**OpenStreetMap**](https://www.openstreetmap.org/ "**OpenStreetMap**") with a library like [**Leaflet**](https://leafletjs.com/ "**Leaflet**") to interact with it. So you can retrive geographical data from your actual view of the map and zoom level.
Examples shown subsequently are made using this type of architecture. 

### Installation
`npm install geojson_tilebuilder`

### Required data type

For the library correct working drawing points and heatmap,  data must be organized in this format: 
`{type: 'FeatureCollection', features: [{value: value, geometry: {type:'Point', coordinates:[latitude, longitude]}}]}`

Instead, to draw square heatmap, are required other two fields: 
`{type: 'FeatureCollection', features: [{value: value, x: x, y: y, geometry: {type:'Point', coordinates:[latitude, longitude]}}]}`
Values x and y represents the coordinates of square inside the tile. 
The tile in this case is divided into n subsquares: x and y represents wich square is described in the feature. 

### Usage

------------

In the class initialization, most of settings are initialized to default value: 
```javascript
this.TILE_SIZE = 512; //512px is default value
this.POINT_RADIUS = 8; //8px is default value

//This constraint represents the number of "big pixel"
//printed in the tile using the method "printSquares"
this.SQUARES_PER_TILE = 16; //16 is default value
//Base options for tiles with heatmap
this.BLURRADIUS = 20; //px
this.CIRCLESRADIUS = 25; //px
this.MIN_OPACITY = 0.05; 
```

- `TILE_SIZE` is the tile side length in pixel; 
- `POINT_RADIUS` is the radius of the points printed; 
- `SQUARES_PER_TILE` is the number of squares in the tile shown in the square heatmap. If you select a power-of-two number, x and y value to add in the data array are equals and are the square root of the number of squares
- `BLUR_RADIUS` is the pixel radius of blur in the heatmap; 
- `CIRCLESRADIUS` is the pixel radius of circles drawn in the heatmap; 
- `MIN_OPACITY ` is the minimum opacity level in the heatmap.


After the initialization, you can use as you want all the methods: 

#### `setSTEP (colorsArray, valuesArray)`
Calling this method allows you to define the steps within wich a certain `value` inside a range of the features mean a certain color in the map.  The params are: 
- `colorsArray` colors represented in RGBA format. This array's length must be equal to `valuesArray.length +1`. This because first color is for data from minimum value to first `valuesArray[0]` data. Second color is the color associated to values between first and second value of `valuesArray`, etc.
#### `setTS (value)`
Sets tile size previously defined to new `value`;
#### `setPR (value)`
Sets point radius previously defined to new `value`;
#### `setCR (value)`
Sets cricles radius previously defined to new `value`;
#### `setMO (value)`
Sets minimum opacity previously defined to new `value`;
#### `setSPT (value)`
Sets squares per tile previously defined to new `value`;
#### `buildBbox (x, y, zoom)`
From x and y latitude and longitude numbers and zoom level, taken from frontend map, returns a bounding box of the form `[w, s, e, n]`, simply using the library [**sphericalmercator**](https://github.com/mapbox/sphericalmercator "**sphericalmercator**");
#### `buildPTile (data, zoom, bbox)`
Passing data with the format for points, zoom level and bounding box, this method retrives the tile with the points, using the settings described before; 
#### `buildHTile (data, zoom, bbox)`
Passing data with the format for heatmap (the same for points), zoom level and bounding box, this method retrives the tile with the heatmap, using the settings described before;
#### `buildSTile (data)`
Passing data with the format for square heatmap (without zoom and bbox) because in data are required also the position coordinates x and y for feature inside the tile; this method retrives the tile with the square heatmap, using the settings described before. 
