// Scatterplot dimensions
var scatterWidth = 1200;
var scatterHeight = 600;
var scatterMargin = { top: 50, right: 60, bottom: 60, left: 60 };

// Create SVG container for scatterplot
var scatterSvg = d3.select("#scatterplot")
    .append("svg")
    .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
    .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + scatterMargin.left + "," + scatterMargin.top + ")");

// Load data
d3.csv("https://raw.githubusercontent.com/LordMertin/g09/main/data/merged_all.csv", function (error, data) {
    if (error) throw error;

    // Convert data to numbers
    data.forEach(function (d) {
        d.gdp = +d.gdp;
        d.price = +d.price;
    });

// Create scales for x and y axes
var xScale = d3.scaleLinear()
    .domain([0, d3.max(data, function (d) { return d.gdp; }) + 12250])
    .range([0, scatterWidth]);

var yScale = d3.scaleLinear()
    .domain([0, d3.max(data, function (d) { return d.price; }) + 1]) // Extend the y domain by 1
    .range([scatterHeight, 0]);


    // Add X axis
    var xAxis = scatterSvg.append("g")
        .attr("transform", "translate(0," + scatterHeight + ")")
        .call(d3.axisBottom(xScale));

    // Add Y axis
    scatterSvg.append("g")
        .call(d3.axisLeft(yScale));

// Add X axis label
scatterSvg.append("text")
    .attr("transform", "translate(" + (scatterWidth / 2) + " ," + (scatterHeight + 15) + ")")
    .style("text-anchor", "middle")
    .style("fill", "black") // Set the text color to black
    .text("GDP per Capita in US-Dollar")
    .attr("dy", "1.5em"); // Adjust the vertical position


// Add Y axis label
scatterSvg.append("text")
.attr("transform", "rotate(-90)")
.attr("y", 0 - scatterMargin.left)
.attr("x", 0 - (scatterHeight / 2))
.attr("dy", "1em")
.style("text-anchor", "middle")
.text("Price of Big Mac");


    // Add a clipPath: everything out of this area won't be drawn.
    var clip = scatterSvg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", scatterWidth)
        .attr("height", scatterHeight)
        .attr("x", 0)
        .attr("y", 0);

    // Add brushing
    var brush = d3.brushX()
        .extent([[0, 0], [scatterWidth, scatterHeight]])
        .on("end", updateChart);

    // Create the scatter variable: where both the circles and the brush take place
    var scatter = scatterSvg.append('g')
        .attr("clip-path", "url(#clip)")
        .call(brush);

    // Add circles
    scatter.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return xScale(d.gdp); })
        .attr("cy", function (d) { return yScale(d.price); })
        .attr("r", 8)
        .style("fill", "steelblue")
        .style("opacity", 0.7);

    // Add labels
scatter.selectAll("text")
.data(data)
.enter()
.append("text")
.attr("x", function (d) { return xScale(d.gdp); })
.attr("y", function (d) { return yScale(d.price) - 10; }) // Adjust the label position
.attr("text-anchor", "middle")
.style("fill", "black") // Set the fill color to black
.text(function (d) { return d.country; }); // Use the country name as the label


    // A function that set idleTimeOut to null
    var idleTimeout;

    function idled() {
        idleTimeout = null;
    }

    // A function that update the chart for given boundaries
    function updateChart() {
        var extent = d3.event.selection;

        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if (!extent) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
            xScale.domain([0, d3.max(data, function (d) { return d.gdp; })]);
        } else {
            xScale.domain([xScale.invert(extent[0]), xScale.invert(extent[1])]);
            scatter.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
        }

        // Update axis, circles, and labels position
        xAxis.transition().duration(1000).call(d3.axisBottom(xScale));
        scatter.selectAll("circle")
            .transition().duration(1000)
            .attr("cx", function (d) { return xScale(d.gdp); })
            .attr("cy", function (d) { return yScale(d.price); });

        scatter.selectAll("text")
            .attr("x", function (d) { return xScale(d.gdp); })
            .attr("y", function (d) { return yScale(d.price) - 10; }); // Adjust the label position
    }
});
