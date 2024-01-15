// The svg for the second map
var priceSvg = d3.select("#PriceMapSVG"),
    priceMapWidth = +priceSvg.attr("width"),
    priceMapHeight = +priceSvg.attr("height");

// The svg for the legend for the second map
var priceLegendSvg = d3.select("#PriceMapLegendSVG"),
    priceLegendWidth = 200,
    priceLegendHeight = 300;

// Map and projection for the second map
var pricePath = d3.geoPath();
var priceProjection = d3.geoMercator()
    .scale(120)
    .center([0, 0])
    .translate([priceMapWidth / 2, priceMapHeight / 2]);

// Data and color scale for the second map
var priceData = d3.map();
var priceColorScale = d3.scaleThreshold()
.domain([1, 2, 3, 4, 5, 6, 7])
.range(d3.schemeGreens[7]);

// Add a tooltip div for the second map
var priceTooltip = d3.select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");

// Load external data and boot for the second map
d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .defer(d3.csv, "https://raw.githubusercontent.com/LordMertin/g09/main/data/merged_all.csv", function (d) { 
        priceData.set(d.iso_a3, [d.iso_a3, d.country, +d.price, +d.gdp]); 
    })
    .await(readyPriceMap);

function readyPriceMap(error, topo) {
    // Draw the second map
    priceSvg.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        .attr("d", d3.geoPath()
            .projection(priceProjection)
        )
        .attr("fill", function (d) {
            d.total = priceData.get(d.id) || 0;
            return priceColorScale(d.total[2]);
        })
        .style("stroke", "transparent")
        .attr("class", function (d) { return "Country" })
        .style("opacity", .8)
        .on("mouseover", priceMouseOver)
        .on("mouseleave", priceMouseLeave)
        .call(d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", function () {
                priceSvg.selectAll('path')
                    .attr('transform', d3.event.transform);
            })
        );

    // Legend for the second map
    var priceLegendColors = priceColorScale.range();

    priceLegendSvg.selectAll("rect")
        .data(priceLegendColors)
        .enter()
        .append("rect")
        .attr("x", 10)
        .attr("y", function (d, i) { return 20 * i; })
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", function (d) { return d; });

    priceLegendSvg.selectAll("text")
        .data(priceColorScale.domain())
        .enter()
        .append("text")
        .attr("x", 60) // Adjust this value for appropriate spacing
        .attr("y", function (d, i) { return 20 * i + 15; })
        .style("font-size", "12px")
        .text(function (d) { return "$" + d; });
}

function priceMouseOver(d) {
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
    priceTooltip.transition()
        .duration(200)
        .style("opacity", 0.9);

    const countryData = priceData.get(d.id);
    const countryName = countryData ? countryData[1] : "Unknown";
    const gdp = countryData ? countryData[3] : "Unknown";
    const price = countryData ? countryData[2] : "Unknown";

    var bigmac = "Unknown";
        if(price > 0){
            bigmac = Math.floor(gdp/price)
        }

    priceTooltip.html("Country: " + countryName + "<br>GDP Per Capita in US-Dollar: $" + gdp + "<br>Product Price: $" + price + "<br>Buyable Big Macs: " + bigmac)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
}

function priceMouseLeave(d) {
    d3.selectAll(".Country")
        .transition()
        .duration(50)
        .style("opacity", .8);

    d3.select(this)
        .transition()
        .duration(50)
        .style("stroke", "transparent");

    // Hide tooltip on mouseleave
    priceTooltip.transition()
        .duration(100)
        .style("opacity", 0);
}
