import '../lib/ol.js'
import {busMapInit} from './init.js'

let busFeed
let alerts
let aliases
let calendar
let shapes
let stop_data

let busColors
let busLayer
let linesLayer
let busStopLayer
let directionLayer
let tile
let map
let bigRes = 12
let start = ol.proj.fromLonLat([12.4964, 41.9028])
let end = ol.proj.fromLonLat([12.5074, 41.9028])

let busMap = () => {
    busMapInit()
    tile = new ol.layer.Tile({source: new ol.source.OSM()})
    initMap(tile)

    Promise.all([
        d3.json("./data/bus_feed.json"),
        d3.json("./data/stop_data.json"),
        d3.json("./data/aliases.json"),
        d3.json("./data/shapes.json"),
        d3.json("./data/alerts.json"),
        d3.json("./data/calendar.json"),
    ]).then(initData)
}

let initMap = (tile) => {
    map = new ol.Map({
        target: 'bus_map',
        layers: [tile],
        view: new ol.View({
            center: ol.proj.fromLonLat([12.4964, 41.9028]),
            zoom: getResolution()
        }),
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true
    });

    let popup = d3.select("#popup").node();
    let popupOverlay = new ol.Overlay({
        element: popup,
        positioning: 'bottom-center',
        offset: [0, -50],
    });

    map.addOverlay(popupOverlay);
    map.on('pointermove', function (e) {
        let feature = map.forEachFeatureAtPixel(e.pixel, function (feature) {
            return feature;
        });
        if (feature) {
            let coordinates = feature.getGeometry().getCoordinates();
            if (Array.isArray(coordinates[0])) {
                coordinates = [
                    (coordinates[0][0] + coordinates[1][0]) / 2,
                    (coordinates[0][1] + coordinates[1][1]) / 2
                ]
            }
            popupOverlay.setPosition(coordinates);
            popup.innerHTML = feature.values_.info
            popup.hidden = false;
        } else {
            popup.innerHTML = '';
            popup.hidden = true;
        }
    });
}
let initData = (data) => {
    busFeed = data[0]
    stop_data = data[1]
    aliases = data[2]
    shapes = data[3]
    alerts = data[4]
    calendar = data[5]

    initSearchMenu(busFeed)
    let randomKey = getRandomKey(busFeed)
    initDrawData(randomKey[0])
    d3.select("#route_search")
        .attr("placeholder", randomKey)
        .attr("value", randomKey)
}
//we draw the first route from a random bus line (ex 780 destination Trastevere)
//then with the destinations menu we let the user choose to draw the other routes from the same line
let initDrawData = (route, destination) => {
    let busData = busFeed[route]
    let destinations = Object.keys(busData)
    if (destination === undefined) {
        destination = destinations[0]
    }
    let routeId = busData[destination][0]
    let buses = busData[destination][1]
    //order by stop sequence
    buses.sort((a, b) => {
        return a[3] - b[3]
    })

    let stopDataKeys = new Set()
    buses.forEach((bus) => {
        stopDataKeys.add(aliases[bus[0]])
    })

    let stopData = {}
    let shapeDataKeys = new Set()
    stopDataKeys.forEach((key) => {
        let data = stop_data[key]
        stopData[data[3]] = data
        shapeDataKeys.add(data[4])
    })
    let alertData = alerts[routeId]
    let shapeData = []
    shapeDataKeys.forEach((key) => {
        shapeData.push(shapes[key])
    })
    drawRoute(buses, stopData, shapeData, route, destination)
    initDestinationMenu(route, destinations)
    initSecondaryInfo(Object.values(stopData)[0], buses.length, buses, shapeData[0], alertData)

    d3.select("#route_search").node().value = route
    d3.select("#destination_search").node().value = destination
}
let initSearchMenu = (busFeed) => {
    let routes = Object.keys(busFeed).sort()
    let menu = d3.select("#route_search_list")
    //route search list
    routes.forEach((route) => {
        menu.append("option")
            .attr("class", "route_choice")
            .attr("value", route)
            .text(route)
            .on("mouseover", function () {
                d3.select(this).style("background-color", "#e8e4e3")
            })
            .on("mouseout", function () {
                d3.select(this).style("background-color", "White")
            })
            .on("click", function () {
                let element = d3.select(this)
                let routeKey = element.node().value
                d3.select("#route_search")
                    .attr("placeholder", routeKey)
                    .attr("value", routeKey)
                d3.select("#route_search_list").style("display", "none")
                d3.select("#destination_search_container").style("display", "block")
                map.removeLayer(busLayer)
                map.removeLayer(busStopLayer)
                map.removeLayer(linesLayer)
                map.removeLayer(directionLayer)

                initDrawData(routeKey)
            })
    })
}
let initDestinationMenu = (route, destinations) => {
    let destinationSearch = d3.select("#destination_search")
    destinationSearch
        .attr("placeholder", destinations[0])
        .attr("value", destinations[0])
    let destinationList = d3.select("#destination_search_list")
    //after the first time we need to clean the current children
    destinationList.html("");
    destinations.forEach((destination) => {
            destinationList.append("option")
                .attr("class", "destination_choice")
                .attr("value", destination)
                .text(destination)
                .on("mouseover", function () {
                    d3.select(this).style("background-color", "#e8e4e3")
                })
                .on("mouseout", function () {
                    d3.select(this).style("background-color", "White")
                })
                .on("click", function () {
                    let element = d3.select(this)
                    let destination = element.node().value
                    destinationSearch
                        .attr("placeholder", destination)
                    destinationSearch.node().value = destination
                    destinationList.style("display", "none")

                    map.removeLayer(busLayer)
                    map.removeLayer(busStopLayer)
                    map.removeLayer(linesLayer)
                    initDrawData(route, destination)
                })
        }
    )
}
let initSecondaryInfo = (stopData, busQuantity, buses, shapeData, alertData) => {
    let totalTravelTime = stopData[1]
    let minutes = Math.floor(totalTravelTime / 60);
    let seconds = totalTravelTime - minutes * 60;
    d3.select("#travel_time")
        .html("Expected total travel time: " + minutes + "m " + seconds + "s")

    updateBusDistances(busQuantity, totalTravelTime, stopData, buses, shapeData)
    drawAlertData(alertData)
}
let updateBusDistances = (busQuantity, totalTravelTime, stopData, buses, shapeData) => {
    if (busQuantity > 1) {
        d3.select("#bus_distance_container")
            .style("display", "block")

        let optimalDistanceContainer = d3.select("#optimal_distance_container")
        let currentDistanceContainer = d3.select("#current_distance_container")
        optimalDistanceContainer.html("")
        currentDistanceContainer.html("")

        let optimalTravelDistance = totalTravelTime / busQuantity
        let minutes = Math.floor(optimalTravelDistance / 60);
        let seconds = Math.floor(optimalTravelDistance - minutes * 60);

        d3.svg("./resources/sd.svg").then((xml) => {

            let svg = xml.documentElement

            svg.style.fill = busColors[0]
            optimalDistanceContainer.node().appendChild(svg.cloneNode(true))

            let i
            for (i = 1; i < buses.length; i++) {
                drawBusDistances(optimalDistanceContainer, optimalTravelDistance, minutes, seconds, busColors[i], svg)
            }

            let totalTravelDistance = getTotalTravelDistance(stopData[0])
            let busPositions = getBusRelativePositions(buses, shapeData, stopData)
            /*busPositions = busPositions.sort((a, b) => {
                return a[0] - b[0]
            })
            console.log(busPositions)*/

            svg.style.fill = busColors[0]
            currentDistanceContainer.node().appendChild(svg.cloneNode(true))

            let j
            for (j = 1; j < buses.length; j++) {
                let dist = busPositions[j][0] - busPositions[j - 1][0]
                if (dist < 0) dist = busPositions[j][0]
                let timeDist = (totalTravelTime / totalTravelDistance) * dist
                let minutes = Math.floor(timeDist / 60);
                let seconds = Math.floor(timeDist - minutes * 60);

                drawBusDistances(currentDistanceContainer, timeDist * timeDist, minutes, seconds, busColors[j], svg)
            }
        })
    } else {
        d3.select("#bus_distance_container")
            .style("display", "none")
    }
}
let drawBusDistances = (distanceContainer, distance, minutes, seconds, color, svg) => {

    let container = distanceContainer.append("div")
        .style("flex-grow", distance)
        .style("align-items", "center")
        .style("padding", "0px 4px 0px 4px")
    container.append("div")
        .html(minutes + "m " + seconds + "s")
        .style("font-family", 'Arial, Helvetica, sans-serif')
        .style("text-align", "center")
    container.append("div")
        .style("flex-grow", "1")
        .style("border-radius", "8px 8px 8px 8px")
        .style("text-align", "center")
        .style("height", "2px")
        .style("background-color", "#ad4584")

    svg.style.fill = color
    distanceContainer.node().appendChild(svg.cloneNode(true))

}
let drawAlertData = (alertData) => {
    if (alertData === undefined) {
        d3.select("#alert_button").style("display", "none")
        d3.select("#alert_info").style("display", "none")
    } else {
        d3.select("#alert_button").style("display", "flex")
        let alertInfo = d3.select("#alert_info")
        alertInfo.html("")
        alertData.forEach((alert) => {
            let start = new Date(alert[0] * 1000)
            let end = new Date(alert[1] * 1000)

            let cause = getCause(alert[2])
            let effect = getEffect(alert[3])
            let title = alert[4]
            let description = alert[5]

            alertInfo
                .append("img")
                .attr("src", "./resources/x.svg")
                .style("width", "20px")
                .on("click", () => {
                    d3.select("#alert_info").style("display", "none")
                    d3.select("#alert_button").style("display", "flex")
                })

            let container = alertInfo.append("div")
                .style("max-width", "50vw")
                .style("max-height", "30vh")
                .style("overflow-y", "auto")
                .style("overflow-x", "hidden")

            container
                .append("div").html(title)
                .style("font-weight", "bold")
                .style("padding", "10px")
            let box = container.append("div")
                .style("border", "2px solid #bbc5c7")
                .style("border-radius", "2px 2px 2px 2px")

            box
                .append("div").html(description)
                .style("padding", "10px")
            box
                .append("div").html("Cause: " + cause)
                .style("padding", "10px")
            box
                .append("div").html("Effect: " + effect)
                .style("padding", "10px")
            box
                .append("div").html("Duration: "
                + start.getDate() + "/"
                + start.getMonth() + "/"
                + start.getFullYear() + " "
                + (start.getHours() < 10 ? '0' : '') + start.getHours() + ":"
                + (start.getMinutes() < 10 ? '0' : '') + start.getMinutes()
                + " - "
                + end.getDate() + "/"
                + end.getMonth() + "/"
                + end.getFullYear() + " "
                + (end.getHours() < 10 ? '0' : '') + end.getHours() + ":"
                + (end.getMinutes() < 10 ? '0' : '') + end.getMinutes()
            )
                .style("padding", "10px")
        })
    }
}

let getTotalTravelDistance = (stopData) => {
    let max = 0
    stopData.forEach((data) => {
        max = max < data[4] ? data[4] : max
    })
    return max
}
//bus position relative to the entire path
//shapeData has the most precise relative positions, but sometimes we don't have that info
//in that case we find the closest stop and use that as relative position
let getBusRelativePositions = (buses, shapeData, stopData) => {
    let positions = []
    let i
    for (i = 0; i < buses.length; i++) {
        positions[i] = [0, -1]
    }
    //if shapeData is valid we don't find a 0 past the first shape
    if (shapeData[1][3] !== 0) {
        shapeData.forEach((shape) => {
            buses.forEach((bus, i) => {
                let x = bus[1] - shape[0]
                let y = bus[2] - shape[1]
                let distance = Math.sqrt(x * x + y * y)
                if (positions[i][1] > distance || positions[i][1] === -1) {
                    positions[i][0] = shape[3]
                    positions[i][1] = distance
                    //console.log(i + " " + shape)
                }
            })
        })
    } else {
        //we use stops as reference
        stopData.for((stop) => {
            buses.forEach((bus, i) => {
                let x = bus[1] - stop[1]
                let y = bus[2] - stop[2]
                let distance = Math.sqrt(x * x + y * y)
                if (positions[i][1] > distance || positions[i][1] === -1) {
                    positions[i][0] = stop[4]
                    positions[i][1] = distance
                }
            })
        })
    }
    return positions

}


let getRoutes = (data) => {
    let routes = {}
    data.forEach((value) => {
        routes[value[2]] = value
    })
    return routes
}
let drawRoute = (buses, stopData, shapeData, routeName, destinationName) => {
    let busStopFeatures = []
    let busFeatures = []
    let busLineFeatures = []
    let busDirections = []

    //if we were to directly draw each array of elements found in this loop we would have a lot of layers
    //this causes lag
    //therefore we first condense every array of elements into one
    let busDirection = "Route: " + routeName + "</br>" + destinationName
    busStopFeatures = getBusStopFeatures(stopData)
    busFeatures = getBusFeatures(buses, busDirection)
    busLineFeatures = getBusPathFeatures(shapeData, busDirection)
    busDirections = getBusDirectionFeatures(stopData, buses)
    console.log(stopData)
    console.log(buses)

    drawBusPath(busLineFeatures)
    drawBusStops(busStopFeatures)
    drawBuses(busFeatures)
    drawBusDirections(busDirections)
}

//get Features
let getBusStopFeatures = (stopData) => {
    let busStopFeatures = []
    Object.values(stopData).forEach((busStops) => {
        let color = randomColor()
        busStops[0].forEach((busStop) => {
            busStopFeatures.push(
                new ol.Feature({
                    geometry: new ol.geom.Point(ol.proj.fromLonLat([busStop[2], busStop[1]])),
                    info: busStop[0] + "</br>" + "n° " + busStop[3],
                    color: color,
                })
            )
        })
    })
    return busStopFeatures
}
let getBusFeatures = (buses, busDirection) => {
    let busFeatures = []
    busColors = []
    buses.forEach((bus) => {
        let color = randomColor()
        busFeatures.push(
            new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([bus[2], bus[1]])),
                info: busDirection, //+ "<br />" + "Next stop: " + busStops[bus[2]][1]
                color: color
            })
        )
        busColors.push(color)
    })
    return busFeatures
}
let getBusPathFeatures = (shapeData, busDirection) => {
    let busLineFeatures = []
    let previousStop
    shapeData.forEach((shapes) => {
        let color = randomColor()
        shapes.forEach((shape) => {
            if (previousStop !== undefined) {
                start = ol.proj.fromLonLat([previousStop[1], previousStop[0]])
                end = ol.proj.fromLonLat([shape[1], shape[0]])
                busLineFeatures.push(
                    new ol.Feature({
                        geometry: new ol.geom.LineString([start, end]),
                        lineColor: color,
                        isArrow: false,
                        info: busDirection
                    })
                )
            }
            previousStop = shape
        })
    })
    return busLineFeatures
}
//bus direction = arrow that points the direction the autobus is going
//We get this arrow by drawing it starting from the bus position and going to the next stop
let getBusDirectionFeatures = (stopData, buses) => {
    let stops = Object.values(stopData)[0][0]
    let busDirectionFeatures = []
    buses.forEach((bus) => {
        let nextStop = stops.find((e) => e[3] === (bus[3] + 1).toString())
        if (nextStop === undefined) nextStop = stops.find((e) => e[3] === (bus[3]).toString())
        start = ol.proj.fromLonLat([bus[2], bus[1]])
        end = ol.proj.fromLonLat([nextStop[2], nextStop[1]])
        busDirectionFeatures.push(
            new ol.Feature({
                geometry: new ol.geom.LineString([start, end]),
                lineColor: 'Red',
                isArrow: true,
                info: ""//"Next stop: " + nextStop[1]
            })
        )
    })
    return busDirectionFeatures
}

//draw Features
let drawBusStops = (busStopFeatures) => {
    let busStopStyle = (feature, zoom) => {
        return new ol.style.Style({
            image: new ol.style.Circle({
                fill: new ol.style.Fill({color: '#FFFFFF'}),
                stroke: new ol.style.Stroke({color: feature.values_.color, width: 3}),
                radius: 4
            })
        });
    }

    let vectorSource = new ol.source.Vector({
        features: busStopFeatures
    });

    busStopLayer = new ol.layer.Vector({
        source: vectorSource,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        style: (feature, resolution) => {
            let zoomVal = Math.min((map.getView().getResolutionForZoom(bigRes) / 9) / resolution, 2)
            return busStopStyle(feature, zoomVal);
        }
    });
    map.addLayer(busStopLayer)
}
let drawBuses = (busFeatures) => {
    let busStyle = (feature) => {
        return new ol.style.Style({
            image: new ol.style.Icon({
                crossOrigin: 'anonymous',
                src: './resources/sd.svg',

                color: feature.values_.color
            })
        })

    }

    let vectorSource = new ol.source.Vector({
        features: busFeatures
    });

    busLayer = new ol.layer.Vector({
        source: vectorSource,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        style: (feature, resolution) => {
            let zoomVal = Math.min(map.getView().getResolutionForZoom(bigRes) / resolution, 2)
            let style = busStyle(feature, resolution)
            //style.getImage().setScale(zoomVal);
            return style
        }
    });
    map.addLayer(busLayer)
}
let drawBusPath = (busLineFeatures) => {
    let lineStyle = (feature) => {
        if (!feature.values_.isArrow) {
            return [
                /*                new ol.style.Style({
                                    stroke: new ol.style.Stroke({
                                        color: '#000000',
                                        width: 8
                                    })
                                }),*/
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        //color: '#ffc66c',
                        color: feature.values_.lineColor,
                        width: 5
                    })
                })
            ];
        }
    }

    let vectorSource = new ol.source.Vector({
        features: busLineFeatures
    });

    linesLayer = new ol.layer.Vector({
        source: vectorSource,
        style: lineStyle
    });
    map.addLayer(linesLayer)
}
let drawBusDirections = (busDirections) => {
    let style = (feature) => {
        let geometry = feature.getGeometry();
        let rotation
        let styles = []

        geometry.forEachSegment(function (start, end) {
            let dx = end[0] - start[0];
            let dy = end[1] - start[1];
            rotation = Math.atan2(dy, dx);

            styles.push(new ol.style.Style({
                geometry: new ol.geom.Point(start),
                image: new ol.style.Icon({
                    src: 'resources/arrow.svg',
                    anchor: [0.75, 0.5],
                    rotateWithView: true,
                    rotation: -rotation,
                }),
            }))
        });

        return styles;
    }

    let vectorSource = new ol.source.Vector({
        features: busDirections
    });

    directionLayer = new ol.layer.Vector({
        source: vectorSource,
        style: style
    });
    map.addLayer(directionLayer)

}


//util functions

let getRandomKey = (data) => {
    let keys = Object.keys(data).sort(() => 0.5 - Math.random());
    return (keys.length >= 1) ? keys.slice(0, 1) : keys.slice(0, keys.length)
}
let getResolution = () => {
    return bigRes
}
let randomColor = () => {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
let getCause = (cause) => {
    switch (cause) {
        case "1":
            return "Unknown cause"
        case "2":
            return "Unknown cause"
        case "3":
            return "Technical problem"
        case "4":
            return "Strike"
        case "5":
            return "Demonstration"
        case "6":
            return "Accident"
        case "7":
            return "Holiday"
        case "8":
            return "Weather"
        case "9":
            return "Maintenance"
        case "10":
            return "Construction"
        case "11":
            return "Police activity"
        case "12":
            return "Medical emergency"
    }
}

let getEffect = (effect) => {
    switch (effect) {
        case "1":
            return "No service"
        case "2":
            return "Reduced service"
        case "3":
            return "Significant delays"
        case "4":
            return "Detour"
        case "5":
            return "Additional service"
        case "6":
            return "Modified service"
        case "7":
            return "Stop moved"
        case "8":
            return "Unknown effect"
        case "9":
            return "Unknown effect"
    }
}

export {busMap}
