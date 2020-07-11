/*Initializes the html styling*/

d3.select("body")
    .style("width", '100vw')
    .style("height", '100vh')
    .style("margin", "0px")
    .style("padding", "0px")

d3.select("#container")
    .style("display", 'flex')
    .style("width", '100%')
    .style("height", '100%')

d3.select("#map")
    .style("display", 'flex')
    .style("align-items", "center")
    .style("justify-content", "center")
    .style('flex-grow', '1')
    .style('flex-basis', 0)
    .style('background-color', "#24292e")

d3.select("#stats_container")
    .style('flex-grow', '1')
    .style('flex-basis', 0)
    .style('background-color', "#1e2226")
