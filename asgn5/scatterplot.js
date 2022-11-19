// Rahul Vaidun, rvaidun@ucsc.edu, helped with this file

let xdomain,
  ydomain,
  xAxis,
  yAxis,
  xScale,
  yScale,
  gX,
  gY,
  circles,
  // circles2,
  countryNames;

// function init() {
//   // set the dimensions and margins of the graph
//   let margin = { top: 20, right: 20, bottom: 30, left: 40 },

//     width = 960 - margin.left - margin.right,
//     height = 500 - margin.top - margin.bottom;
// Define Margins
var margin = { left: 80, right: 80, top: 50, bottom: 50 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// Define Color
var colors = d3.scaleOrdinal(d3.schemeCategory10);

var svg = d3
  .select("#scatterplot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
// .call(d3.zoom().on("zoom", zoomed));

// Code from Rahul Vaidun, rvaidun@ucsc.edu
// loads html first before csv
let loadedData;
document.addEventListener("DOMContentLoaded", () => {
  d3.csv("scatterdata.csv", d3.autoType).then((data) => {
    loadedData = data;
    // get domain for x and y
    xdomain = d3.extent(loadedData, (d) => d.gdp);
    ydomain = d3.extent(loadedData, (d) => d.ecc);

    drawScatterPlot();
  });
});

function drawScatterPlot() {
  //Define SVG
  var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //Define Scales
  xScale = d3.scaleLinear().domain(xdomain).range([0, width]);
  yScale = d3.scaleLinear().domain(ydomain).range([height, 0]);

  // define Color Scale
  var colorScale = d3
    .scaleOrdinal()
    .domain(loadedData.map((d) => d.country))
    .range(d3.schemeCategory10)
    .unknown("#ccc");

  //Define Tooltip here
  var tooltip = d3.select(".tooltip");

  //Define Axis
  xAxis = d3.axisBottom().scale(xScale).tickPadding(2);
  yAxis = d3.axisLeft().scale(yScale).tickPadding(2);

  //Define Zoom
  var zoom = d3
    .zoom()
    .scaleExtent([1, 40])
    .translateExtent([
      [-100, -100],
      [width + 200, height + 200],
    ])
    .on("zoom", zoomed);
  
  // Define Circles
  // circles2 = svg
  //   .selectAll("circle")
  //   .data(loadedData)
  //   .enter()
  //   .append("circle")
  //   .attr("cx", (d) => xScale(d.gdp))
  //   .attr("cy", (d) => yScale(d.ecc))
  //   .attr("r", 5)
  //   .attr("fill", (d) => colorScale(d.country))
  //   .on("mouseover", function (d) {
  //     tooltip
  //       .style("opacity", 1)
  //       .html(
  //         "<b>Country:</b> " +
  //           d.country +
  //           "<br>" +
  //           "<b>GDP:</b> " +
  //           d.gdp +
  //           "<br>" +
  //           "<b>ECC:</b> " +
  //           d.ecc
  //       )
  //       .style("left", d3.event.pageX + "px")
  //       .style("top", d3.event.pageY + "px");
  //   })
  //   .on("mouseout", function (d) {
  //     tooltip.style("opacity", 0);
  //   });
  
  //x-axis
  gX = svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  gX.append("text")
    .attr("class", "label")
    .attr("y", 30)
    .attr("x", width / 2)
    .style("text-anchor", "middle")
    .style("fill", "black")
    .attr("font-size", "12px")
    .text("GDP (in Trillion US Dollars) in 2010")
    .attr("font-weight", "bold");

  //Y-axis
  gY = svg.append("g").attr("class", "y axis").call(yAxis);
  gY.append("text")
    .attr("class", "label")
    .attr("y", -50)
    .attr("x", -20)
    .attr("dy", ".71em")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "end")
    .attr("font-size", "12px")
    .style("fill", "black")
    .text("Energy Consumption per Capita (in Million BTUs per person)")
    .attr("font-weight", "bold");

  //Draw Scatterplot

  circles = svg
    .selectAll("circle")
    // loading data from csv
    .data(loadedData)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.gdp))
    .attr("cy", (d) => yScale(d.ecc))
    .attr("r", (d) => d.ec / 2)
    .attr("fill", (d) => colorScale(d.country))
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .on("mouseover", function (d) {
      d3.select(this).attr("fill", "red");
      tooltip.style("opacity", 1).html(
        "<b>Country:</b> " +
          d.country +
          "<br>" +
          "<b>GDP:</b> " +
          d.gdp +
          "<br>" +
          "<b>ECC:</b> " +
          d.ecc +
          "<br>" +
          "<b> Total EC:</b> " +
          d.ec
      )
      .style("left", d3.event.pageX + "px")
      .style("top", d3.event.pageY + "px");
      tooltip.style("left", d3.event.pageX + "px").style("top", d3.event.pageY + "px");
    })
    .on("mousemove", () => {
      // moves tooltip with the mouse
      tooltip
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px");
      
    })
    .on("mouseout", function (d) {
      // does not show tooltip when mouse is not over the circle
      d3.select(this).attr("fill", colorScale(d.country));
      // hides tooltip
      tooltip.style("opacity", 0);
    });

  // add zoom to svg
  svg.call(zoom);

    // on("click", function (d) {
    //   // hide tooltip when mouse is out of circle
    //   d3.select(this).attr("fill", colorScale(d.country));
    //   tooltip.transition().duration(50).style("opacity", 0);
    // });

  // add country name to each circle

  // svg.selectAll(".text")
  //       .data(scatterdataset)
  //       .enter().append("text")
  //       .attr("class","text")
  //       .style("text-anchor", "start")
  //       .attr("x", function(d) {return xScale(d.gdp);})
  //       .attr("y", function(d) {return yScale(d.epc);})
  //       .style("fill", "black")
  //       .text(function (d) {return d.name; });
  countryNames = svg
    .selectAll(".text")
    .data(loadedData)
    .enter()
    .append("text")
    .attr("x", (d) => xScale(d.gdp))
    .attr("y", (d) => yScale(d.ecc))
    .attr("dy", ".35em")
    .attr("text-anchor", "left")
    .attr("font-size", "10px")
    .attr("fill", "black")
    .attr("dx", 10)
    .attr("dy", 5)
    .text((d) => d.country);

  // Legend here - guided by Rahul Vaidun
  // 1 trillion btu circle
  svg
    .append("text")
    .attr("x", width - 200)
    .attr("y", height - 10)
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    // add margin to the top
    .attr("dy", ".40em")
    .text("Energy Consumption");
  svg
    .append("circle")
    .attr("r", 1 / 2)
    .attr("stroke", "black")
    .attr("cx", width - 130)
    .attr("cy", height - 150)

  svg
    .append("text")
    .attr("x", width - 123)
    .attr("y", height - 147)
    .attr("fill", "black")
    .text("1 trillion BTUs");

  // 10 trillion btu circle
  svg
    .append("circle")
    .attr("cx", width - 130)
    .attr("cy", height - 130)
    .attr("r", 10 / 2)

  svg
    .append("text")
    .attr("x", width - 118)
    .attr("y", height - 127)
    .text("10 trillion BTUs");

  // 100 trillion btu circle
  svg
    .append("circle")
    .attr("cx", width - 135)
    .attr("cy", height - 70)
    .attr("r", 100 / 2)
    .attr("stroke", "black")
    .attr("stroke-width", 1);

  svg
    .append("text")
    .attr("x", width - 85)
    .attr("y", height - 70)
    .attr("fill", "black")
    .text("100 trillion BTUs");
    

  //Scale Changes as we Zoom
  d3.select("svg").call(zoom);
}

// Rahul Vaidun's zoomed function
// this function is called when the user zooms in or out
function zoomed(e) {
  // when svg is zoomed this function runs
  const transform = d3.event.transform;
  console.log(transform);

  // update the x and y axis
  gX.call(xAxis.scale(transform.rescaleX(xScale)));
  gY.call(yAxis.scale(transform.rescaleY(yScale)));

  // update the circles and country names
  circles.attr("transform", transform);
  // circles2.attr("transform", transform);
  countryNames.attr("transform", transform);

  // update the tooltip
  tooltip
    .style("left", d3.event.pageX + "px")
    .style("top", d3.event.pageY + "px");
}

function updateScatterplot(year) {
  // filter the data to get the data for the selected year
  var loadedData = scatterdataset.filter((d) => d.year == year);

  // update the x and y axis
  xScale.domain([0, d3.max(loadedData, (d) => d.gdp)]);
  yScale.domain([0, d3.max(loadedData, (d) => d.ecc)]);

  // update the x and y axis
  gX.call(xAxis.scale(xScale));
  gY.call(yAxis.scale(yScale));

  // update the circles and country names
  circles.data(loadedData).attr("cx", (d) => xScale(d.gdp)).attr("cy", (d) => yScale(d.ecc));
  countryNames.data(loadedData).attr("x", (d) => xScale(d.gdp)).attr("y", (d) => yScale(d.ecc));

  // update the tooltip
  tooltip
    .style("left", d3.event.pageX + "px")
    .style("top", d3.event.pageY + "px");
}