const margin_bc = { top: 25, right: 20, bottom: 40, left: 175};



// Get the container dimensions
const containerWidth = document.getElementById("barChart").offsetWidth;
const containerHeight = document.getElementById("barChart").offsetHeight;

// Calculate the chart dimensions based on the container size
const width_bc = containerWidth - margin_bc.left - margin_bc.right;
const height_bc = containerHeight - margin_bc.top - margin_bc.bottom;


const svg = d3.select("#barChart")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${width_bc + margin_bc.left + margin_bc.right} ${height_bc + margin_bc.top + margin_bc.bottom}`)
    // .attr("width", 800)
    // .attr("height", 400);



const data = bc_data.map(d => ({
    name: d.course_name,
    active: d.active_questions,
    inactive: d.inactive_questions
}));

const qcounts = d3.map(data, d => d.active + d.inactive);


const x = d3.scaleLinear()
    .rangeRound([0, width_bc - 100]);

const y = d3.scaleBand()
    .rangeRound([height_bc, 0])
    .padding(0.1);

const g = svg.append("g")
    .attr("transform", `translate(${margin_bc.left},${margin_bc.top})`);

x.domain([0, d3.max(qcounts)]);
y.domain(data.map(d => d.name));

const stack = d3.stack()
    .keys(["active", "inactive"])
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);


const series = stack(data);


g.append("g")
    .selectAll("g")
    .data(series)
    .enter().append("g")
    .attr("fill", (d, i) => d3.schemeDark2[i])
    .selectAll("rect")
    .data(d => d)
    .enter().append("rect")
    .attr("x", d => x(d[0]))
    .attr("y", d => y(d.data.name))
    .attr("width", d => x(d[1]) - x(d[0]))
    .attr("height", y.bandwidth())
    .attr("class", "bar");

g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0,${height_bc})`)
    .call(d3.axisBottom(x).ticks(5));

g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y))
    .style("font-size", "12px");

const legend = g.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(series)
    .enter().append("g")
    .attr("transform", (d, i) => `translate(0,${i * 20})`);

legend.append("rect")
    .attr("x", width_bc - 19)
    .attr("width", 19)
    .attr("height", 19)
    .attr("fill", (d, i) => d3.schemeDark2[i]);

legend.append("text")
    .attr("x", width_bc - 30)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .text(d => d.key.toUpperCase())
    .style("font-weight", "bold")

// x label
g.append("text")
    .attr("class", "axis-label")
    .attr("x", width_bc / 2 - 50)
    .attr("y", height_bc + margin_bc.bottom - 5)
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Total Questions");


// Add chart title
svg.append("text")
    .attr("class", "chart-title")
    .attr("x", width_bc / 2 + margin_bc.left - 10)
    .attr("y", margin_bc.top - 10)
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Distribution of Active and Inactive Questions by Course");
