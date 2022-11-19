// This file was guided by Rahul Vaidun, rvaidun@ucsc.edu

var mapSvg, tooltip, mapttstring;
var mapData;
var popData;
var drawborder = true;
var margin = { left: 80, right: 80, top: 50, bottom: 50 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;


// Code from rvaidun
// runs upon page load
document.addEventListener("DOMContentLoaded", function () {
  mapSvg = d3.select("#dataviz");
  tooltip = d3.select(".tooltip");
  // sets dimensions of the svg
  mapSvg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  // load the data, after loading, draw the map
  Promise.all([d3.json("us.geojson"), d3.csv("population.csv")]).then(function (
    values
  ) {
    mapData = values[0];
    popData = values[1];
    // the properties.STATE corresponds to the state code in the population data
    mapData.features = mapData.features.filter(function (d) {
      return d.properties.STATE == 18;
    });

    // display label Indiana
    popData = popData.filter(function (d) {
      return d["GEO.display-label"] == "Indiana";
    });
    createState();
  });
});

var orange = true;
function togglecolor() {
  if (orange == true) {
    orange = false;
  } else {
    orange = true;
  }
  createState();
}
function toggleborder() {
  drawborder = !drawborder;
  createState();
}

// Draw the map in the #map svg
function createState() {
  // create a projection
  // projection guided by rvaidun
  mapSvg.selectAll("*").remove();
  let projection = d3
    .geoMercator()
    .scale(400)
    .center(d3.geoCentroid(mapData))
    .translate([
      +mapSvg.style("width").replace("px", "") / 2,
      +mapSvg.style("height").replace("px", "") / 2.3,
    ])
    // adjusting size of map
    .scale(5000)
    .translate([width / 2, height / 2])
    .precision(0.1)
    .fitSize([width, height], mapData)
    // .fitExtent(
    //   [
    //     [margin.left, margin.top],
    //     [width - margin.right, height - margin.bottom],
    //   ],
    //   mapData
    // );
  let path = d3.geoPath().projection(projection);
  let extent = d3.extent(
    popData,
    (d) => +d["Density per square mile of land area"]
  );

  if (orange == true) {
    var colorScale = d3.scaleSequential(d3.interpolateOrRd).domain(extent);
  } else {
    var colorScale = d3.scaleSequential(d3.interpolateBlues).domain(extent);
  }

  // draw the map on the #map svg
  var tooltip = d3.select(".tooltip");
  let g = mapSvg.append("g");
  g.selectAll("path")
    .data(mapData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("id", (d) => {
      return d.properties.name;
    })
    .attr("class", "countrymap")
    .style("fill", (d) => {
      let val = popData.filter((p) => {
        return p["GCT_STUB.target-geo-id"] == d.properties.GEO_ID;
      })[0]["Density per square mile of land area"];
      return colorScale(val);
    })
    .style("stroke", drawborder ? "black" : "none")
    .on("mouseover", function (d, i) {
      let val = popData.filter((p) => {
        return p["GCT_STUB.target-geo-id"] == d.properties.GEO_ID;
      })[0]["Density per square mile of land area"];
      if (drawborder)
        d3.select(this).style("stroke", "lightgreen").style("stroke-width", 7);
      tooltip.transition().duration(50).style("opacity", 1)
      .style("opacity", 1);
      console.log(d.properties);
      mapttstring = `County: ${d.properties.NAME} <br/>
                     Population Density per square mile of land area: ${val} <br/>
                     GEO ID: ${d.properties.GEO_ID}`;
      tooltip.html(
        mapttstring
      )
    })
    .on("mousemove", function (d, i) {
      tooltip.style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
    })
    .on("mouseout", function (d, i) {
      d3.select(this)
        .style("stroke", drawborder ? "black" : "none")
        .style("stroke-width", 1);
      tooltip.transition().duration("50").style("opacity", 0);
      d3.select(this).attr("fill", "black");
            tooltip.style("opacity", 0);
    });
  // map legend
  axisScale = d3.scaleLinear().domain(colorScale.domain()).range([10, 210])

  axisBottom = (g) =>
    g
      .attr("class", `x-axis`)
      .attr("transform", `translate(0,400)`)
      .call(d3.axisBottom(axisScale).ticks(4).tickSize(20));
  
  mapSvg.append("g").call(axisBottom);
  // mapSvg.append("text")
  //   .attr("x", 10)
  //   .attr("y", 400)
  //   .attr("dy", "1em")
  //   .style("text-anchor", "start")
  //   .text("Population Density per square mile of land area");

  // this part of the legend was also heavily guided by rvaidun
  const defs = mapSvg.append("defs");

  const linearGradient = defs
    .append("linearGradient")
    .attr("id", "linear-gradient");

  linearGradient
    .selectAll("stop")
    .data(
      colorScale.ticks().map((t, i, n) => ({
        offset: `${(100 * i) / n.length}%`,
        color: colorScale(t),
      }))
    )
    .enter()
    .append("stop")
    .attr("offset", (d) => d.offset)
    .attr("stop-color", (d) => d.color)
    .attr("stop-opacity", 1);

  mapSvg
    .append("g")
    .attr("transform", `translate(0,380)`)
    .append("rect")
    .attr("transform", `translate(10, 0)`)
    .attr("width", 200)
    .attr("height", 20)
    .style("fill", "url(#linear-gradient)")
    // .call(axisBottom);
  mapSvg.append("g").call(axisBottom);

  mapSvg
    .append("text")
    .attr("transform", `translate(10, 460)`)
    .attr("class", "legend")
    .text("Population Density per square mile of land area");
  
  
}


