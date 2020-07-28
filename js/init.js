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
        .on("click", () => {
            d3.select("#route_search_list")
                .style("display", "none")
            d3.select("#destination_search_list")
                .style("display", "none")
            d3.select("#destination_search_container")
                .style("display", "block")
        })
    d3.select("#popup")
        .style("background", "White")
        .style("padding", "5px")
        .style("border-radius", "4px")
        .style("text-align", "center")
        .style("border-style", "solid")
        .style("border-width", "1px")
        .style("border-color", "#171b21")
        .style("font-family", 'Arial, Helvetica, sans-serif')
    d3.select("#destination_search")
        .on("click", () => {
            d3.select("#destination_search_list")
                .style("display", "block")
            d3.select("#route_search_list")
                .style("display", "none")
        })
        .on("keyup", function () {
            let value = d3.select(this).node().value
            d3.select("#destination_search_list").style("display", "block")
            let options = d3.selectAll(".destination_choice").nodes()
            options.forEach((option) => {
                option.value.toLowerCase().includes(value.toLowerCase()) ? option.style.display = "block" : option.style.display = "none"
            })
        })
    d3.select("#route_search")
        .on("click", () => {
            d3.select("#route_search_list")
                .style("display", "block")
            d3.select("#destination_search_container")
                .style("display", "none")
            d3.select("#destination_search_list")
                .style("display", "none")
        })
        .on("keyup", function () {
            let value = d3.select(this).node().value
            d3.select("#route_search_list").style("display", "block")
            let options = d3.selectAll(".route_choice").nodes()
            options.forEach((option) => {
                option.value.includes(value) ? option.style.display = "block" : option.style.display = "none"
            })
        })
    d3.select("#route_select")
        .style("position", "absolute")
        .style("top", 0)
        .style("right", 0)
        .style("background", "White")
        .style("width", '20%')
        .style("border-radius", "0px 0px 0px 8px")
        .style("border-left", "1px solid #171b21")
        .style("border-bottom", "1px solid #171b21")
        .style("font-family", 'Arial, Helvetica, sans-serif')
        .style("padding", "15px")
    d3.selectAll(".searcher")
        .style("width", "40%")
    d3.selectAll(".search_list")
        .style("border", "1px solid #cdc7c2")
        .style("background", "White")
        .style("padding", "3px")
        .style("max-height", "30vh")
        .style("overflow", "scroll")
        .style("overflow-x", "hidden")
        .style("display", "none")
    d3.select(".route_choice")
}


export {indexInit, municipalityMapInit, busMapInit}