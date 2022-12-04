var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 110, left: 40},
    margin2 = {top: 430, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

//Define Color
var colors = d3.scaleOrdinal(d3.schemePaired)

var parseDate = d3.timeParse("%Y");

var x = d3.scaleTime().range([0, width]),
    x2 = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x2);

var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

d3.csv("testdata.csv", type, function(error, data) {
  if (error) throw error;

  x.domain(d3.extent(data, function(d) { return d.date; }));
  x2.domain(x.domain());

  focus.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .style("stroke", "white")
    .call(xAxis);

  context.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height2 + ")")
      .style("stroke", "white")
      .call(xAxis2);

  context.append("g")
      .attr("class", "brush")
      .style("stroke", "white")
      .call(brush)
      .call(brush.move, x.range());

  svg.append("rect")
      .attr("class", "zoom")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .style("stroke", "white")
      .call(zoom);

    //create a node for each data point
    var node = focus.selectAll(".node")
        .data(data)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + x(d.date) + "," + y(d.book) + ")"; });

    //add a circle to each node
    node.append("circle")
        .attr("r", 5)
        .style("fill", function(d) { return colors(d.name); })
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d.name + "<br/>"  + d.book)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on("mousemove", function(d) {
            tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        });
    
    var tooltip = d3.select(".tooltip");

    //add nodes to the svg right above the x axis
    svg.append("g")
        .attr("class", "nodes")
        .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
        .selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("r", 8)
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", 0)
        // .style("fill", function(d) { return colors(d.name); })
        .style("fill", "steelblue")
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            // console.log(Date.parse(d.date));
            // convert d.date into only year string
            var date = new Date(d.date);
            var year = date.getFullYear();
            tooltip.html(d.name + "<br/> Year: " + year + "<br/> Books: "  + d.book + "<br/> Description: " + d.desc)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        }
        )
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        }
        )
        .on("mousemove", function(d) {
            tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        }
        );

});

function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    svg.selectAll(".nodes circle")
        .attr("cx", function(d) { return x(d.date); });
    focus.select(".axis--x").call(xAxis);
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0));
}

function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());
    svg.selectAll(".nodes circle")
        .attr("cx", function(d) { return x(d.date); });
    focus.select(".axis--x").call(xAxis);
    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
}

function type(d) {
    d.date = parseDate(d.date);
    // d.book = +d.book;
    return d;
}