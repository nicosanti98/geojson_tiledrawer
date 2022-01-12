**geojson_tilebuilder** provides a way to draw inside a tile points, heatmaps and square heatmaps based on the same data type. 

### What can you do
- Is possible to draw geoJSON data as points: 
![Points](https://github.com/nicosanti98/geojson_tiledrawer/blob/main/images/pallini.png "apap")
- Is possible to draw geoJSON data as heatmap: 
![Heatmap](https://github.com/nicosanti98/geojson_tiledrawer/blob/main/images/hetamap.png "Heatmap")
- And also geoJSON data as square heatmap: 
![Square Heatmap](https://github.com/nicosanti98/geojson_tiledrawer/blob/main/images/squarehetamap.png "Square Heatmap")


Points and heatmap references directly to geogrphical data: for each element in data the library draws a point or an heatmap. 
As regards square heatmap, instead, the library draws a prefixed number of squares inside a tiles. Every square color is based on the average of "points value" inside the square area. 

The power of the library is that with the same data types you can select different ways to represent them in the same tiles, rather then use different types in different libraries.

### Prerequisites
To use the library as tile drawer and to overlay it in a map in order to represent geographical data, is necessary to use a map, like **OpenStreetMap** with a library like **Leaflet** to interact with it. So you can retrive geographical data from your actual view of the map and zoom level.
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

### Use

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
- `SQUARES_PER_TILE` is the number of squares in the tile shown in the square heatmap. If you select a power-of-two number, x and y value to add in the data array are equals and are square root of numeber of squares; 
- `BLUR_RADIUS` is the pixel radius of blur in the heatmap; 
- `CIRCLESRADIUS` is the pixel radius of circles drawn in the heatmap; 
- `MIN_OPACITY ` is the minimum opacity level in the heatmap.


After the initialization, you can use as you want all the methods: 

#### `setSTEP (colorsArray, valuesArray)`
