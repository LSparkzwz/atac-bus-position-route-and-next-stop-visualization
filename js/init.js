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
<<<<<<< HEAD
    d3.select("#popup")
        .style("background", "White")
        .style("padding", "5px")
        .style("border-radius", "4px")
        .style("text-align", "center")
        .style("border-style", "solid")
        .style("border-width", "1px")
        .style("border-color", "#171b21")
        .style("font-family", 'Arial, Helvetica, sans-serif')
    d3.select("#route_select")
        .style("position", "absolute")
        .style("top", 0)
        .style("right", 0)
        .style("background", "White")
        .style("width", '10%')
        .style("height", '10%')
        .style("border-radius", "0px 0px 0px 8px")
        .style("border-left", "1px solid #171b21")
        .style("border-bottom", "1px solid #171b21")
        .style("font-family", 'Arial, Helvetica, sans-serif')
        .style("padding", "15px")
    d3.select("#route_search")
        .style("margin", 0)
    d3.select("#search_list")
        .style("border", "1px solid #cdc7c2")
        .style("background", "White")
        .style("padding", "3px")
    d3.select(".route_choice")
        .on("mouseover", function (d, i) {
            console.log(d, i)
            d3.select(this).style("background-color", "#2980B9")
        })
        .on("mouseout", () => {
        });

}

=======
}

>>>>>>> 19a26738b70e77618556893b774aafad3712d7cd

export {indexInit, municipalityMapInit, busMapInit}