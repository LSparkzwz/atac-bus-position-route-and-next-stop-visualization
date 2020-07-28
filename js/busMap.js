import '../lib/ol.js'
import {busMapInit} from './init.js'

let busLayer
let linesLayer
let busStopLayer
let tile
let map
let busFeed
let destinations
let bigRes = 12
let start = ol.proj.fromLonLat([12.4964, 41.9028])
let end = ol.proj.fromLonLat([12.5074, 41.9028])

let busMap = () => {
    busMapInit()
    tile = new ol.layer.Tile({source: new ol.source.OSM()})
    initMap(tile)
    d3.json("./data/bus_feed.json").then(initData);
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
    busFeed = data
    initSearchMenu(data)
    let randomKey = getRandomKey(data)
    initDrawData(data, randomKey)
    d3.select("#route_search")
        .attr("placeholder", randomKey)
        .attr("value", randomKey)
}
//we draw the first route from a random bus line (ex 780 destination Trastevere)
//then with the destinations menu we let the user choose to draw the other routes from the same line
let initDrawData = (data, key) => {
    let routes = getRoutes(data[key]['bus_routes'])
    let routeKeys = Object.keys(routes)
    drawRoute(routes[routeKeys[0]], key)
    initDestinationMenu(routes, routeKeys)

    d3.select("#route_search").node().value = key
    d3.select("#destination_search").node().value = routeKeys[0]
}
let initSearchMenu = (data) => {
    let routes = Object.keys(data).sort()
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
                initDrawData(busFeed, routeKey)
            })
    })
}
let initDestinationMenu = (routes, destinations) => {
    let destinationSearch = d3.select("#destination_search")
    destinationSearch
        .attr("placeholder", destinations[0])
        .attr("value", destinations[0])
    let destinationList = d3.select("#destination_search_list")
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
                    let route = element.node().value
                    destinationSearch
                        .attr("placeholder", route)
                    destinationSearch.node().value = route
                    destinationList.style("display", "none")

                    map.removeLayer(busLayer)
                    map.removeLayer(busStopLayer)
                    map.removeLayer(linesLayer)
                    drawRoute(routes[route], route)
                })
        }
    )
}

let getRoutes = (data) => {
    let routes = {}
    data.forEach((value) => {
        routes[value[2]] = value
    })
    return routes
}
let drawRoute = (route, key) => {
    let busStopFeatures = []
    let busFeatures = []
    let busLineFeatures = []

    //ordering by bus stop order
    let buses = route[0].sort((val1, val2) => val1[2] - val2[2])
    let busStops = route[1].sort((val1, val2) => val1[0] - val2[0])
    //if we were to directly draw each array of elements found in this loop we would have a lot of layers
    //this causes lag
    //therefore we first condense every array of elements into one
    let busDirection = "Route: " + key + "</br>" + route[2]
    busStopFeatures = busStopFeatures.concat(getBusStopFeatures(busStops))
    busFeatures = busFeatures.concat(getBusFeatures(buses, busDirection, busStops))
    busLineFeatures = busLineFeatures.concat(getBusLineFeatures(busStops, busDirection))
    busLineFeatures = busLineFeatures.concat(getBusDirectionFeatures(busStops, buses))

    drawBusLines(busLineFeatures)
    drawBusStops(busStopFeatures)
    drawBuses(busFeatures)
}

//get Features
let getBusStopFeatures = (busStops) => {
    let busStopFeatures = []
    busStops.forEach((busStop) => {
        busStopFeatures.push(
            new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([busStop[3], busStop[2]])),
                info: busStop[1] + "</br>" + "n° " + busStop[0]
            })
        )
    })
    return busStopFeatures
}
let getBusFeatures = (buses, busDirection, busStops) => {
    let busFeatures = []
    buses.forEach((bus) => {
        busFeatures.push(
            new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([bus[1], bus[0]])),
                info: busDirection + "<br />" + "Next stop: " + busStops[bus[2]][1]
            })
        )
    })
    return busFeatures
}
let getBusLineFeatures = (busStops, busDirection) => {
    let busLineFeatures = []
    let previousStop
    let color = randomColor()
    busStops.forEach((busStop) => {
        if (previousStop !== undefined) {
            start = ol.proj.fromLonLat([previousStop[3], previousStop[2]])
            end = ol.proj.fromLonLat([busStop[3], busStop[2]])
            busLineFeatures.push(
                new ol.Feature({
                    geometry: new ol.geom.LineString([start, end]),
                    lineColor: color,
                    isArrow: false,
                    info: busDirection
                })
            )
        }
        previousStop = busStop
    })
    return busLineFeatures
}
//bus direction = arrow that points the direction the autobus is going
//We get this arrow by drawing it starting from the bus position and going to the next stop
let getBusDirectionFeatures = (busStops, buses) => {
    let busDirectionFeatures = []
    buses.forEach((bus) => {
        let nextStop = busStops[bus[2]]
        start = ol.proj.fromLonLat([bus[1], bus[0]])
        end = ol.proj.fromLonLat([nextStop[3], nextStop[2]])
        busDirectionFeatures.push(
            new ol.Feature({
                geometry: new ol.geom.LineString([start, end]),
                lineColor: 'Red',
                isArrow: true,
                info: "Next stop: " + nextStop[1]
            })
        )
    })
    return busDirectionFeatures
}

//draw Features
let drawBusStops = (busStopFeatures) => {
    let busStopStyle = new ol.style.Style({
        image: new ol.style.Icon({
            src: './resources/bus-stop.svg',
        })
    });

    let vectorSource = new ol.source.Vector({
        features: busStopFeatures
    });

    busStopLayer = new ol.layer.Vector({
        source: vectorSource,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        style: (feature, resolution) => {
            let zoomVal = Math.min((map.getView().getResolutionForZoom(bigRes) / 9) / resolution, 2)
            busStopStyle.getImage().setScale(zoomVal);
            return busStopStyle;
        }
    });
    map.addLayer(busStopLayer)
}
let drawBuses = (busFeatures) => {
    let busStyle = new ol.style.Style({
        image: new ol.style.Icon({
            src: './resources/bus.svg',
        })
    });

    let vectorSource = new ol.source.Vector({
        features: busFeatures
    });

    busLayer = new ol.layer.Vector({
        source: vectorSource,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        style: (feature, resolution) => {
            let zoomVal = Math.min(map.getView().getResolutionForZoom(bigRes) / resolution, 2)
            busStyle.getImage().setScale(zoomVal);
            return busStyle;
        }
    });
    map.addLayer(busLayer)
}
let drawBusLines = (busLineFeatures) => {
    let lineStyle = (feature) => {
        if (!feature.values_.isArrow) {
            return [
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#000000',
                        width: 8
                    })
                }),
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        //color: '#ffc66c',
                        color: feature.values_.lineColor,
                        width: 5
                    })
                })
            ];
        } else {
            let geometry = feature.getGeometry();
            let styles = [
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'Red',
                        width: 15
                    })
                }),
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'White',
                        width: 6
                    })
                }),
            ];

            geometry.forEachSegment(function (start, end) {
                let dx = end[0] - start[0];
                let dy = end[1] - start[1];
                let rotation = Math.atan2(dy, dx);

                let lineStr1 = new ol.geom.LineString([end, [end[0] - 100, end[1] + 100]]);
                lineStr1.rotate(rotation, end);
                let lineStr2 = new ol.geom.LineString([end, [end[0] - 100, end[1] - 100]]);
                lineStr2.rotate(rotation, end);

                let stroke = new ol.style.Stroke({
                    color: 'Red',
                    width: 8
                });

                styles.push(new ol.style.Style({
                    geometry: lineStr1,
                    stroke: stroke
                }));
                styles.push(new ol.style.Style({
                    geometry: lineStr2,
                    stroke: stroke
                }));
            });

            return styles;
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

export {busMap}