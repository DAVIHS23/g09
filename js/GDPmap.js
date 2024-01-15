// The svg for the map
var svg = d3.select("#GDPmapSVG"),
    mapWidth = +svg.attr("width"),
    mapHeight = +svg.attr("height");

// The svg for the legend
var legendSvg = d3.select("#GDPmapLegendSVG"),
    legendWidth = 200,
    legendHeight = 300;

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
    .scale(120)
    .center([0, 0])
    .translate([mapWidth / 2, mapHeight / 2]);

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
    .domain([500, 1000, 2500, 5000, 10000, 25000, 50000])
    .range(d3.schemeBlues[7]);

// Add a tooltip div
var tooltip = d3.select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");

// Declare histogramSvg as a global variable
var histogramSvg;

// Load external data and boot
d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .defer(d3.csv, "https://raw.githubusercontent.com/LordMertin/g09/main/data/merged_all.csv", function (d) { 
        data.set(d.iso_a3, [d.iso_a3, d.country, +d.price, +d.gdp]); 
    })
    .await(ready);

function ready(error, topo) {

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .attr("fill", function (d) {
            d.total = data.get(d.id) || 0;
            return colorScale(d.total[3]);
        })
        .style("stroke", "transparent")
        .attr("class", function (d) { return "Country" })
        .style("opacity", .8)
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)
        .call(d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", function () {
                svg.selectAll('path')
                    .attr('transform', d3.event.transform);
            })
        );

  legendColors = colorScale.range();

  legendSvg.selectAll("rect")
    .data(legendColors)
    .enter()
    .append("rect")
    .attr("x", 10)
    .attr("y", function (d, i) { return 20 * i; })
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", function (d) { return d; });

    legendSvg.selectAll("text")
    .data(colorScale.domain())
    .enter()
    .append("text")
    .attr("x", 60) // Adjust this value for appropriate spacing
    .attr("y", function (d, i) { return 20 * i + 15; })
    .style("font-size", "12px")
    .text(function (d) { return "$"+d; });

    /*histogramSvg = d3.select("#histogram")
        .append("svg")
        .attr("width", histogramWidth + histogramMargin.left + histogramMargin.right)
        .attr("height", histogramHeight + histogramMargin.top + histogramMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + histogramMargin.left + "," + histogramMargin.top + ")");*/

        function mouseOver(d) {
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", 0.5);
        
            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke", "black");
        
            // Show tooltip with the country, GDP, and price
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
        
            const countryData = data.get(d.id);
            const countryName = countryData ? countryData[1] : "Unknown";
            const gdp = countryData ? countryData[3] : "Unknown";
            const price = countryData ? countryData[2] : "Unknown";
        
            var bigmac = "Unknown";
            if (price > 0) {
                bigmac = Math.floor(gdp / price)
            }
        
            tooltip.html("Country: " + countryName + "<br>GDP Per Capita in US-Dollar: $" + gdp + "<br>Product Price: $" + price + "<br>Buyable Big Macs: " + bigmac)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        
                /*var countryNameHistogram = d.total[1];
                console.log("Country Name from Histogram: ", countryNameHistogram);
                
                // Use the country name to filter the histogram data
                histogramSvg.selectAll("rect")
                    .filter(function (histogramData) {
                        console.log("histogramdata: " + histogramData);
                        return histogramData.country === countryNameHistogram;
                    })
                    .style("fill", "orange");*/
        }
        
    
    

    function mouseLeave(d) {
        d3.selectAll(".Country")
            .transition()
            .duration(50)
            .style("opacity", .8);

        d3.select(this)
            .transition()
            .duration(50)
            .style("stroke", "transparent");

        // Hide tooltip on mouseleave
        tooltip.transition()
            .duration(100)
            .style("opacity", 0);

        /*// Reset the color of the highlighted bar in the histogram
        histogramSvg.selectAll("rect")
            .style("fill", "steelblue");*/
    }
}