/*
Majority of this code is copy pasted from https://bl.ocks.org/mbostock/3884955, a website provided to students
for this assignment.
I also received help from Arad Levin, alevin4@ucsc.edu, for multiple parts of this file
*/

// This code is meant for d3 v5
var margin = {top: 20, right: 80, bottom: 30, left: 90},
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//var svg = d3.select("body").append("svg"),
//    margin = {top: 20, right: 80, bottom: 30, left: 50},
//    width = svg.attr("width") - margin.left - margin.right,
//    height = svg.attr("height") - margin.top - margin.bottom,
//    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%y");

var x = d3.scaleTime().rangeRound([0, width]),
    y = d3.scaleLinear().rangeRound([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);


var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { 
        return x(d.year); })
    .y(function(d) { return y(d.millions); });


var xAxis = d3.axisBottom(x).ticks(10).tickFormat(d3.format("d"));
var yAxis = d3.axisLeft(y).ticks(7);

const bigData  = d3.csvParse("EPCSMallMillionBTU.csv", d3.autoType);

// Get the data
d3.csv("EPCSMallMillionBTU.csv").then(function(bigData){
//      var countries = bigData.columns.slice(1).map(function(id) {
//        return {
//          id: id,
//          values: data.map(function(d) {
//            return {date: d.date, millions: d[id]};
//          })
//        };
//      });
    //This sets the domain for the x and y axes
    x.domain(d3.extent(bigData, function(d) { return d.date; }));
    // Using Arad Levin's y domain
    y.domain([0,400]);
//      y.domain([
//    d3.min(countries, function(c) { return d3.min(c.values, function(d) { return d.temperature; }); }),
//    d3.max(countries, function(c) { return d3.max(c.values, function(d) { return d.millions; }); })
//  ]);

    // Axis configuration
    z.domain(bigData.columns.slice(1).map(function(key) { return key; }));
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .text("Million BTUs Per Person")
        .attr("transform", "rotate(-90)")
        .attr("x", -190)
        .attr("dy", "-40px")
        .attr("fill", "black")

    
    // Arad Levin, alevin4@ucsc.edu, helped me with these functions: transition, tweenDash as well as vLine
    // and all the attributes of vLine
    //Create the value lines
    var vLine = svg.selectAll(".vLine")
        .data(bigData.columns.slice(1).map(function(key) {
            return {
                key: key,
                values: bigData.map(function(d) {
                    return {date: d.date, value: d[key]};
                })
            };
        })).enter()

    // Duration of drawing lines
    function transition(path) {
        path.transition()
            .duration(3000)
            .attrTween("stroke-dasharray", tweenDash)
    }

    function tweenDash() {
        const l = this.getTotalLength(), i = d3.interpolateString("0," + l, l + "," + l);
        return function(t) { return i(t) };
    }

    // Draws each line here and calls transition() for each line
    vLine.append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", function(d) { return z(d.key); })
      .attr("d", function(d) { return d3.line()
        .x(function(d) { return x(d.date)})
        .y(function(d) { return y(d.value)})
        (d.values); })
      .call(transition);

    // Writes the country names at the end of each line
    vLine.append("text")
      .datum(function(d) { return {key: d.key, item: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.item.date) + "," + y(d.item.value) + ")"; })
      .style("font", "13px sans-serif")
      .style("color", "black")
      .style("fill", "black")
      .text(function(d) { return d.key; });
});