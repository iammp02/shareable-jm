var margin_lc = { top: 45, right: 30, bottom: 40, left: 55 },
    width_lc = 560 - margin_lc.left - margin_lc.right,
    height_lc = 400 - margin_lc.top - margin_lc.bottom;

// append the svg object to the body of the page
var svg_lc = d3.select("#lineChart")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${width_lc + margin_lc.left + margin_lc.right} ${height_lc + margin_lc.top + margin_lc.bottom}`)
    // .attr("width", width_lc + margin_lc.left + margin_lc.right)
    // .attr("height", height_lc + margin_lc.top + margin_lc.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin_lc.left + "," + margin_lc.top + ")");


lc_data.forEach(function (d) {
    d.date = new Date(d.date);
    d.count = +d.count;
});

var x_lc = d3.scaleTime()
    .domain(d3.extent(lc_data, function (d) { return d.date; }))
    .range([0, width_lc]);
svg_lc.append("g")
    .attr("transform", "translate(0," + height_lc + ")")
    .call(d3.axisBottom(x_lc)
        // .ticks(d3.timeDay.every(1))
        .tickValues([x_lc.domain()[0]].concat(x_lc.ticks(7)))
        // .tickValues([x_lc.domain()[0]].concat(x_lc.ticks(d3.timeDay.every(1))))
        .tickFormat(d3.timeFormat("%Y-%m-%d")))
    .selectAll("text")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("text-anchor", "middle")
    .attr("dx", "-.12em");
// Add Y axis
var y_lc = d3.scaleLinear()
    .domain([0, d3.max(lc_data, function (d) { return +d.value; })])
    .range([height_lc, 0]);
svg_lc.append("g")
    .call(d3.axisLeft(y_lc))
    .selectAll("text")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("text-anchor", "middle")
    .attr("dx", "-10px");


svg_lc.append("path")
    .datum(lc_data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
        .x(function (d) { return x_lc(d.date) })
        .y(function (d) { return y_lc(d.value) })
    );



svg_lc.append("text")
    .attr("transform", "translate(" + (width_lc / 2) + " ," + (height_lc + margin_lc.bottom ) + ")")
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Date");

svg_lc.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin_lc.left)
    .attr("x", 0 - (height_lc / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Question count");

svg_lc.append("text")
    .attr("x", (width_lc / 2))
    .attr("y", -5 - (margin_lc.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Trend of Questions Added Over Time");
