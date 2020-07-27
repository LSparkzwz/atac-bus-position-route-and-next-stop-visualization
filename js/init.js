/*Initializes the html styling*/

let indexInit = () => {
    d3.select("body")
        .style("width", '100vw')
        .style("height", '100vh')
        .style("margin", "0px")
        .style("padding", "0px")
}

let municipalityMapInit = () => {
    d3.select("#bus_map")
        .style('display', 'none')
    d3.select("#municipality_map_container")
        .style("display", 'flex')
        .style("width", '100%')
        .style("height", '100%')
    d3.select("#municipality_map")
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
}

let busMapInit = () => {
    d3.select("#municipality_map_container")
        .style("display", 'none')
    d3.select("#bus_map")
        .style("display", 'flex')
        .style("width", '100%')
        .style("height", '100%')
}


export {indexInit, municipalityMapInit, busMapInit}