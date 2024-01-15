// Set up a map to store data for each country
var dataMap = new Map();

// Load data using D3.js
d3.csv("https://raw.githubusercontent.com/LordMertin/g09/main/data/merged_all.csv", function (error, data) {
    if (error) throw error;

    // Fill the dataMap with data for each country
    data.forEach(function (d) {
        var country = d.country;
        if (!dataMap.has(country)) {
            dataMap.set(country, []);
        }
        dataMap.get(country).push({
            gdp: +d.gdp,
            price: +d.price,
        });
    });

    // Filter out entries with an empty or zero price
    dataMap.forEach(function (value, key, map) {
        map.set(key, value.filter(function (d) {
            return d.price !== null && d.price !== 0;
        }));
    });

    // Extract data for the histogram with gdp/price rounded down
    var histogramData = [];
    dataMap.forEach(function (value, key) {
        if (value.length > 0) {
            histogramData.push({
                country: key,
                buyableBigMacs: d3.mean(value, function (d) { return Math.floor(d.gdp / d.price); })
            });
        }
    });

    // Sort histogramData in descending order based on buyableBigMacs
    histogramData.sort(function (a, b) {
        return b.buyableBigMacs - a.buyableBigMacs;
    });

    // Set the dimensions and margins of the graph
    var histogramMargin = { top: 40, right: 20, bottom: 120, left: 60 };
    var histogramWidth = 900 - histogramMargin.left - histogramMargin.right;
    var histogramHeight = 800 - histogramMargin.top - histogramMargin.bottom;

    // Create SVG container for histogram
    var histogramSvg = d3.select("#histogram")
        .append("svg")
        .attr("width", histogramWidth + histogramMargin.left + histogramMargin.right)
        .attr("height", histogramHeight + histogramMargin.top + histogramMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + histogramMargin.left + "," + histogramMargin.top + ")");

    // Create scales for x and y axes
    var xScaleHistogram = d3.scaleBand()
        .domain(histogramData.map(function (d) { return d.country; }))
        .range([0, histogramWidth])
        .padding(0.1);

    var yScaleHistogram = d3.scaleLinear()
        .domain([0, d3.max(histogramData, function (d) { return d.buyableBigMacs; })])
        .range([histogramHeight, 0]);

    // Add X axis
    histogramSvg.append("g")
        .attr("transform", "translate(0," + histogramHeight + ")")
        .call(d3.axisBottom(xScaleHistogram))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-45)");

    // Add Y axis
    var yAxis = histogramSvg.append("g")
        .call(d3.axisLeft(yScaleHistogram));

    // Add bars to the histogram
    var bars = histogramSvg.selectAll("rect")
    .data(histogramData)
    .enter().append("rect")
    .attr("x", function (d) { return xScaleHistogram(d.country); })
    .attr("y", function (d) { return yScaleHistogram(d.buyableBigMacs); })
    .attr("width", xScaleHistogram.bandwidth())
    .attr("height", function (d) { return histogramHeight - yScaleHistogram(d.buyableBigMacs); })
    .style("fill", "steelblue")
    .on("mouseover", function (d) {
        // Highlight the corresponding country on the map
        var countryClass = d.country.replace(/\s/g, ''); // Remove spaces from country name
        d3.selectAll(".Country." + countryClass)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "black");
    
        // Highlight the corresponding bar in the histogram
        d3.selectAll("rect")
            .filter(function (histogramData) {
                return histogramData.country === d.country;
            })
            .transition()
            .duration(200)
            .style("fill", "orange");
    })
    .on("mouseleave", function (d) {
        // Reset the color of the corresponding country on the map
        var countryClass = d.country.replace(/\s/g, ''); // Remove spaces from country name
        d3.selectAll(".Country." + countryClass)
            .transition()
            .duration(50)
            .style("opacity", .8)
            .style("stroke", "transparent");
    });

    // Add labels to the bars
    histogramSvg.selectAll(".bar-label")
        .data(histogramData)
        .enter().append("text")
        .attr("class", "bar-label")
        .attr("x", function (d) { return xScaleHistogram(d.country) + xScaleHistogram.bandwidth() / 2; })
        .attr("y", function (d) { return yScaleHistogram(d.buyableBigMacs) - 5; })
        .attr("text-anchor", "middle")
        .text(function (d) { return d.buyableBigMacs; })
        .style("font-size", "10px")
        .style("fill", "black");


    
});
