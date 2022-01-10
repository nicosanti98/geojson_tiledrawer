//CLASS EXPORTED

//Importing libraries
let SphericalMercator = require('@mapbox/sphericalmercator'); 
let Canvas = require('canvas');
let simpleheat = require('simpleheat'); 

class TileBuilder{
    
    constructor(){
        this.TILE_SIZE = 512; //512px is default value
        this.POINT_RADIUS = 8; //8px is default value

        //This constraint represents the number of "big pixel"
        //printed in the tile using the method "printSquares"
        this.SQUARES_PER_TILE = 16; //16 is default value
        this.VAL_ARR = []; 
        this.VAL_COL = []; 


        //Base options for tiles with heatmap
        this.BLURRADIUS = 20; //px
        this.CIRCLESRADIUS = 25; //px
        this.MIN_OPACITY = 0.05; 
    }


    //Sets the values of color in rgba and relatives data value
    setSTEP(arrVal, arrCol)
    {
        //Colors are different in range between two values
        //of arrVal. So arrCol.lenght must be arrVal.lenght+1
        if((arrVal.length + 1) != arrCol.length)
        {
            throw "Arrays are malformed";
        }
        else
        {
            this.VAL_ARR = arrVal; 
            this.VAL_COL = arrCol; 
        }
        
        
    }

    //Method to set point radius
    setPR(value)
    {
        //Returns an exception if point radius is too big
        //and if is too small
        if(value >= 64)
        {
            throw "Radius value too big"; 
        }
        else if(value < 2)
        {
            throw "Radius value too small"; 
        }
        else
        {
            this.POINT_RADIUS = value; 
            
        }
    }

    //Sets the blur radius on the heatmap
    setBR(value)
    {
        if(value <= 0) 
        {
            throw "Blur radius must be more than 0";
        }
        else
        {
            this.BLURRADIUS = value; 
        }
        
    }

    //Sets the cirlce radius on the heatmap
    setCR(value)
    {
        if(value <= 0)
        {
            throw "Circles radius must be more than 0"; 
        }
        else
        {
                this.CIRCLESRADIUS = value; 
        }
       
    }

    //Sets the minimum opacity value
    setMO(value)
    {
        if(value <= 0)
        {
            throw "Circles opacity must be a positive value"
        }
        else
        {
            this.MIN_OPACITY = value; 
        }
        
    }

    //This method allow users to set SQUARES_PER_TILES value (default 16)
    setSPT(value)
    {
        if(Number.isInteger(value))
        {
            if(value <= 0)
            {
                throw "SQUARES_PER_TILE value must be more than 0"; 
            }
            else
            {
                this.SQUARES_PER_TILE = value;
            }
             
        }
        else
        {
            throw "Non-Integer value"; 
        }

    }

    //this method returns the bounding box from x and y coords and a certain zoom level
    buildBbox(x, y, zoom) 
    {
        
        
        //Create a SphericalMercator istance with size = TILE_SIZE
        let merc = new SphericalMercator({size: this.TILE_SIZE}); 

        //boundedbox contains a bbox generated from x, y and zoom
        let boundingbox = merc.bbox(x, y, zoom); 
        return boundingbox; 

    }

    //This method returns a png file which represents the tile 
    //with the points

    //Expected data format: 
    //{features: [{ value: double, geometry:  { type: 'Point', coordinates: [ double, double] } }, ...]}

    //Are also required zoom and bbox to know where to draw points inside the tile

    buildPTile(data, zoom, bbox)
    {
        let canvas = Canvas.createCanvas(this.TILE_SIZE, this.TILE_SIZE);
        let context = canvas.getContext('2d');

        for (let feature of data.features){

            let value = feature.value; 
            let color; 

            
            // absolute pixel position of the border box NE and SW vertexes
            let sw = this.absolutePosition([bbox[0], bbox[1]], zoom);
            let ne = this.absolutePosition([bbox[2], bbox[3]], zoom);

            //Give different colors independently from colors and steps arrays length
            if (value <= this.VAL_ARR[0])
            {
                color = this.VAL_COL[0];
            }
            else if (value > this.VAL_ARR[this.VAL_ARR.length - 1])
            {
                color = this.VAL_COL[this.VAL_COL.length - 1];
            }
            else
            {
                for(let i = 1; i < this.VAL_ARR.length; i++)
                {
                    if(value <= this.VAL_ARR[i] && value > this.VAL_ARR[i-1])
                    {
                        color = this.VAL_COL[i];
                    }
                }
            
            }

            let lon = feature.geometry.coordinates[0];
            let lat = feature.geometry.coordinates[1];

            // absolute pixel position of the feature
            let absPos = this.absolutePosition([lon, lat], zoom);

            // position of the point inside the tile
            let relPos = [
                absPos[0] - sw[0],
                absPos[1] - ne[1]
            ];

            context.beginPath();
            context.fillStyle = color;
            context.arc(relPos[0], relPos[1], this.POINT_RADIUS, 0, Math.PI*2);
            context.closePath();
            context.fill();
        
        }
        //returned canvas. The server that uses the library
        //can return png from canvas
        return canvas; 
    }

    //This method builds a tile containing a heatmap
    //Is shown zones with higher data frequency
    buildHTile(data, zoom, bbox)
    {
        let canvas = Canvas.createCanvas(this.TILE_SIZE, this.TILE_SIZE);

        //This method uses library simpleheat library to draw the tile
        let heat = simpleheat(canvas); 

        //build gradient options as specified in simpleheat library docs
        let grad = {}; 

        for(let i = 0; i < this.VAL_ARR.length; i++)
        {
            grad[this.VAL_ARR[i]] = this.VAL_COL[i]; 
        }

        // absolute pixel position of the border box NE and SW vertexes
        let sw = this.absolutePosition([bbox[0], bbox[1]], zoom);
        let ne = this.absolutePosition([bbox[2], bbox[3]], zoom);


        let max = 0; 
        let points=[]; 

        for(let feature of data.features){

            let lon = feature.geometry.coordinates[0];
            let lat = feature.geometry.coordinates[1];

            // absolute pixel position of the feature
            let absPos = this.absolutePosition([lon, lat], zoom);

            // position of the point inside the tile
            let relPos = [
                absPos[0] - sw[0],
                absPos[1] - ne[1]
            ];

            if (feature.value >= max)
            {
                max = feature.value;
            }

            

            let point = []; 

            //Point format for simpleheat library is [x, y, ppe]
            point.push(relPos[0]); 
            point.push(relPos[1]); 
            point.push(feature.value); 

            points.push(point); 

        }

        //Set heatmap options
        heat.gradient(grad); 
        heat.radius(this.CIRCLESRADIUS, this.BLURRADIUS); 
        heat.max(max); 
        heat.data(points); 
        heat.draw(this.MIN_OPACITY);


        return canvas;

    }

    buildSTile(data, zoom, bbox)
    {
        
        let canvas = Canvas.createCanvas(this.TILE_SIZE, this.TILE_SIZE);
        let context = canvas.getContext('2d');

        for (let feature of data.features){

            let value = feature.value; 
            let color; 

            

            //Give different colors independently from colors and steps arrays length
            if (value <= this.VAL_ARR[0])
            {
                color = this.VAL_COL[0];
            }
            else if (value > this.VAL_ARR[this.VAL_ARR.length - 1])
            {
                color = this.VAL_COL[this.VAL_COL.length - 1];
            }
            else
            {
                for(let i = 1; i < this.VAL_ARR.length; i++)
                {
                    if(value <= this.VAL_ARR[i] && value > this.VAL_ARR[i-1])
                    {
                        color = this.VAL_COL[i];
                    }
                }
            
            }

            context.beginPath();
            context.fillStyle = color; 
            context.rect((this.TILE_SIZE/this.SQUARES_PER_TILE) * (feature.x), (this.TILE_SIZE/this.SQUARES_PER_TILE) * (this.SQUARES_PER_TILE - feature.y - 1), (this.TILE_SIZE/this.SQUARES_PER_TILE) ,(this.TILE_SIZE/this.SQUARES_PER_TILE));
            context.closePath(); 
            context.fill();
        
        }
        //returned canvas. The server that uses the library
        //can return png from canvas
        return canvas; 

    }

    //this method provide user to get absolute bottom-left and top-right pixel position inside of the bounding box
    absolutePosition([lon, lat], zoom)
    {

        //Create a SphericalMercator istance with size = TILE_SIZE
        let merc = new SphericalMercator({size: this.TILE_SIZE}); 

        //This method simply uses a method of
        //SphericalMercator class
        let abs = merc.px([lon, lat], zoom);

        return abs;  

    }

}

module.exports ={
    TileBuilder: TileBuilder
}

exports.POINT_RADIUS = this.POINT_RADIUS; 
exports.VAL_COL = this.VAL_COL; 
exports.VAL_ARR = this.VAL_ARR;
exports.BLURRADIUS = this.BLURRADIUS; 
exports.CIRCLESRADIUS = this.CIRCLESRADIUS; 



