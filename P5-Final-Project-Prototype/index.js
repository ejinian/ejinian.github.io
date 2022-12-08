var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 110, left: 40},
    margin2 = {top: 430, right: 20, bottom: 30, left: 40},
    margin3 = {top: 352, right: 20, bottom: 130, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;
    height3 = +svg.attr("height") - margin3.top - margin3.bottom;

//Define Color
var colors = d3.scaleOrdinal(d3.schemeCategory10);

var x = d3.scaleTime().range([0, width]),
    x2 = d3.scaleTime().range([0, width]),
    x3 = d3.scaleTime().range([0, width]),
    x4 = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]),
    y3 = d3.scaleLinear().range([height3, 0]);

var xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
    xAxis2 = d3.axisBottom(x2).tickFormat(d3.format("d"));
    xAxis3 = d3.axisBottom(x3).tickFormat(d3.format("d"));

var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

var zoom = d3.zoom()
    .scaleExtent([1, 200])
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

var secondLine = svg.append("g")
    .attr("class", "secondLine")
    .attr("transform", "translate(" + margin3.left + "," + margin3.top + ")");

d3.csv("testdata.csv", function(error, data) {
  if (error) throw error;

    x.domain(d3.extent(data, function(d) { return d.date - 1; }));
    x2.domain(x.domain());
    x3.domain(d3.extent(data, function(d) { return d.date - 1; }).reverse());
    x4.domain(x3.domain());

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

  secondLine.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 - 60 + ")")
        .style("stroke", "white")
        .call(xAxis3);

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

    /*
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
        */
    
    var tooltip = d3.select(".tooltip");

    //save the value of the node's period in string format to a variable
    var period = 

    //add nodes to the svg right above the x axis
    svg.append("g")
        .attr("class", "nodes")
        .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
        .selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("r", 8)
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", function(d) { if (d.period == "BC") { return -40; } else { return 0; } })
        .style("fill", function(d) { return colors(d.period); })
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            // console.log(Date.parse(d.date));
            // convert d.date into only year string
            var year = d.date;
            tooltip.html(d.name + "<br/> Year: " + year + "<br/> Books: "  + d.book)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            d3.select(this)
                .attr("r", 12);

        }
        )
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            d3.select(this)
                .attr("r", 8);
        }
        )
        .on("mousemove", function(d) {
            tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        // on click, display an the imagesource of the book
        .on("click", function(d) {
            var bookImage = d.image;
            var img = document.getElementById("book-image");
            var text = document.getElementById("book-text");
            img.src = bookImage;
            img.style.width = "30%";
            text.innerHTML = d.desc;
            var zoomRect = d3.select(".zoom");
            console.log(zoomRect);
            // zoomRect.append("svg:image")
            //     .attr("xlink:href", bookImage)
            //     .attr("x", 0)
            //     .attr("y", 0)
            //     .attr("width", 100)
            //     .attr("height", 100)
            //     .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")");
        }
        );
});

function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    var f = d3.event.selection || x4.range();
    x.domain(s.map(x2.invert, x2));
    x3.domain(s.map(x4.invert, x4));
    svg.selectAll(".nodes circle")
        .attr("cx", function(d) { return x(d.date); });
    focus.select(".axis--x").call(xAxis);
    secondLine.select(".axis--x").call(xAxis3);
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0));
}

function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());
    x3.domain(t.rescaleX(x4).domain());
    svg.selectAll(".nodes circle")
        .attr("cx", function(d) { return x(d.date); });
    focus.select(".axis--x").call(xAxis);
    secondLine.select(".axis--x").call(xAxis3);
    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
}


//on document ready function
$(document).ready(function() {    
    $("img").css("width", "100%");
    $("img").css("height", "100%");

    if (window.outerHeight <= 1060) {
        $(".row").css("position", "relative");
    } else {
        $(".row").css("position", "absolute");
    }
});


window.addEventListener("resize", function() {
     if (window.outerWidth <= 1120) {
        $("img").css("width", "100%");
        $("img").css("height", "100%");
     }
});


window.addEventListener("resize", function() {
    if (window.outerHeight <= 1060) {
        $(".row").css("position", "relative");
    } else {
        $(".row").css("position", "absolute");
    }
});