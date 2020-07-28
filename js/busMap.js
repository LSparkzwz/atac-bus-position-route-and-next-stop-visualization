import '../lib/ol.js'
import {busMapInit} from './init.js'

let busLayer
let linesLayer
let tile
let map
<<<<<<< HEAD
let bigRes = 12
let entryAmount = 1
let start = ol.proj.fromLonLat([12.4964, 41.9028])
let end = ol.proj.fromLonLat([12.5074, 41.9028])

let busMap = () => {
    busMapInit()
    tile = new ol.layer.Tile({source: new ol.source.OSM()})
    initMap(tile)
    d3.json("./data/bus_feed.json").then(initData);
}
=======
let bigRes = 13.5
let entryAmount = 5

let
    busMap = () => {
        busMapInit()
        tile = new ol.layer.Tile({source: new ol.source.OSM()})
        initMap(tile)
        d3.json("./data/bus_feed.json").then(initDrawData);
    }

>>>>>>> 19a26738b70e77618556893b774aafad3712d7cd
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
<<<<<<< HEAD

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
    initSearchMenu(data)
    initDrawData(data)
}

let initSearchMenu = (data) => {
    let routes = Object.keys(data).sort()
    let menu = d3.select("#route_search")
    menu.on("click", () => {

    })

}

let initDrawData = (data) => {
    //we decide to show "entryAmount" random bus routes from the data available
    let randomKeys = [49] //getRandomKey(data)
    drawData(data, randomKeys)
}
=======
}

let start = ol.proj.fromLonLat([12.4964, 41.9028])
let end = ol.proj.fromLonLat([12.5074, 41.9028])

let initDrawData = (data) => {
    //we decide to show "entryAmount" random bus routes from the data available
    let randomKeys = getRandomKey(data)
    drawData(data, randomKeys)
}

>>>>>>> 19a26738b70e77618556893b774aafad3712d7cd
let drawData = (data, keys) => {
    let busStopFeatures = []
    let busFeatures = []
    let busLineFeatures = []
    keys.forEach((key) => {
        let route = data[key]['bus_routes']
        //A route name (ex. 780, 170 etc..) can have 1+ routes, usually 2 (round trip), but even 1 or more than 2
        route.forEach((value) => {
            //ordering by bus stop order
            let buses = value[0].sort((val1, val2) => val1[2] - val2[2])
            let busStops = value[1].sort((val1, val2) => val1[0] - val2[0])
            //if we were to directly draw each array of elements found in this loop we would have a lot of layers
            //this causes lag
            //therefore we first condense every array of elements into one
<<<<<<< HEAD
            let busDirection = "Route: " + key + "</br>" + value[2]
            busStopFeatures = busStopFeatures.concat(getBusStopFeatures(busStops))
            busFeatures = busFeatures.concat(getBusFeatures(buses, busDirection, busStops))
            busLineFeatures = busLineFeatures.concat(getBusLineFeatures(busStops, busDirection))
            busLineFeatures = busLineFeatures.concat(getBusDirectionFeatures(busStops, buses))
=======
            busStopFeatures = busStopFeatures.concat(getBusStopFeatures(busStops))
            busFeatures = busFeatures.concat(getBusFeatures(buses))
            busLineFeatures = busLineFeatures.concat(getBusLineFeatures(busStops, key + ": " + value[2]))
            busLineFeatures = busLineFeatures.concat(getBustDirectionFeatures(busStops, buses))
>>>>>>> 19a26738b70e77618556893b774aafad3712d7cd
        })
    })
    drawBusLines(busLineFeatures)
    drawBusStops(busStopFeatures)
    drawBuses(busFeatures)
}

<<<<<<< HEAD
//get Features

=======
>>>>>>> 19a26738b70e77618556893b774aafad3712d7cd
let getBusStopFeatures = (busStops) => {
    let busStopFeatures = []
    busStops.forEach((busStop) => {
        busStopFeatures.push(
            new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([busStop[3], busStop[2]])),
<<<<<<< HEAD
                info: busStop[1] + "</br>" + "n° " + busStop[0]
=======
                name: busStop[1]
>>>>>>> 19a26738b70e77618556893b774aafad3712d7cd
            })
        )
    })
    return busStopFeatures
}
<<<<<<< HEAD
let getBusFeatures = (buses, busDirection, busStops) => {
=======
let getBusFeatures = (buses) => {
>>>>>>> 19a26738b70e77618556893b774aafad3712d7cd
    let busFeatures = []
    buses.forEach((bus) => {
        busFeatures.push(
            new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([bus[1], bus[0]])),
<<<<<<< HEAD
                info: busDirection + "<br />" + "Next stop: " + busStops[bus[2]][1]
=======
>>>>>>> 19a26738b70e77618556893b774aafad3712d7cd
            })
        )
    })
    return busFeatures
}
<<<<<<< HEAD
let getBusLineFeatures = (busStops, busDirection) => {
    let busLineFeatures = []
    let previousStop
    let color = randomColor()
=======
let getBusLineFeatures = (busStops, entry) => {
    let busLineFeatures = []
    let previousStop
    let lineColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
>>>>>>> 19a26738b70e77618556893b774aafad3712d7cd
    busStops.forEach((busStop) => {
        if (previousStop !== undefined) {
            start = ol.proj.fromLonLat([previousStop[3], previousStop[2]])
            end = ol.proj.fromLonLat([busStop[3], busStop[2]])
            busLineFeatures.push(
                new ol.Feature({
                    geometry: new ol.geom.LineString([start, end]),
<<<<<<< HEAD
                    lineColor: color,
                    isArrow: false,
                    info: busDirection
=======
                    lineColor: lineColor,
                    name: entry,
                    isArrow: false,
>>>>>>> 19a26738b70e77618556893b774aafad3712d7cd
                })
            )
        }
        previousStop = busStop
    })
    return busLineFeatures
}
//bus direction = arrow that points the direction the autobus is going
//We get this arrow by drawing it starting from the bus position and going to the next stop
<<<<<<< HEAD
let getBusDirectionFeatures = (busStops, buses) => {
    let busDirectionFeatures = []
    buses.forEach((bus) => {
        let nextStop = busStops[bus[2]]
        start = ol.proj.fromLonLat([bus[1], bus[0]])
        end = ol.proj.fromLonLat([nextStop[3], nextStop[2]])
=======
let getBustDirectionFeatures = (busStops, buses) => {
    let busDirectionFeatures = []
    buses.forEach((bus) => {
        //we know the next stop but we don't know its coordinates
        let nextStop = bus[2]
        let busStop = busStops[bus[2]]
        //most if not all the time array bus stop position = bus stop number
        //we try to avoid looping in order to find the number the correct way
        if (busStop[0] !== nextStop) {
            busStops.forEach((stop) => {
                if (stop[0] === nextStop) {
                    busStop = stop
                }
            })
        }
        start = ol.proj.fromLonLat([bus[1], bus[0]])
        end = ol.proj.fromLonLat([busStop[3], busStop[2]])
>>>>>>> 19a26738b70e77618556893b774aafad3712d7cd
        busDirectionFeatures.push(
            new ol.Feature({
                geometry: new ol.geom.LineString([start, end]),
                lineColor: 'Red',
<<<<<<< HEAD
                isArrow: true,
                info: "Next stop: " + nextStop[1]
=======
                isArrow: true
>>>>>>> 19a26738b70e77618556893b774aafad3712d7cd
            })
        )
    })
    return busDirectionFeatures
}

<<<<<<< HEAD
//draw Features

let drawBusStops = (busStopFeatures) => {
    let busStopStyle = new ol.style.Style({
        image: new ol.style.Icon({
            src: './resources/bus-stop.svg',
=======
let drawBusStops = (busStopFeatures) => {
    let busStopStyle = new ol.style.Style({
        image: new ol.style.Icon({
            src: './resources/stop.svg',
            scale: 0.4
>>>>>>> 19a26738b70e77618556893b774aafad3712d7cd
        })
    });

    let vectorSource = new ol.source.Vector({
        features: busStopFeatures
    });

    busLayer = new ol.layer.Vector({
        source: vectorSource,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        style: (feature, resolution) => {
<<<<<<< HEAD
            let zoomVal = Math.min((map.getView().getResolutionForZoom(bigRes) / 15) / resolution, 2)
            busStopStyle.getImage().setScale(zoomVal);
=======
            let zoomVal = Math.min(map.getView().getResolutionForZoom(bigRes) / resolution, 2)
            busStopStyle.getImage().setScale(Math.min(zoomVal, resolution));
>>>>>>> 19a26738b70e77618556893b774aafad3712d7cd
            return busStopStyle;
        }
    });

    map.addLayer(busLayer)
}
let drawBuses = (busFeatures) => {
    let busStyle = new ol.style.Style({
        image: new ol.style.Icon({
            src: './resources/bus.svg',
<<<<<<< HEAD
=======
            scale: 0.2
>>>>>>> 19a26738b70e77618556893b774aafad3712d7cd
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
<<<<<<< HEAD
            busStyle.getImage().setScale(zoomVal);
=======
            busStyle.getImage().setScale(Math.min(zoomVal, resolution));
>>>>>>> 19a26738b70e77618556893b774aafad3712d7cd
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

<<<<<<< HEAD
=======

>>>>>>> 19a26738b70e77618556893b774aafad3712d7cd
    let vectorSource = new ol.source.Vector({
        features: busLineFeatures
    });

    linesLayer = new ol.layer.Vector({
        source: vectorSource,
        style: lineStyle
    });

    map.addLayer(linesLayer)
}

<<<<<<< HEAD

//util functions

=======
>>>>>>> 19a26738b70e77618556893b774aafad3712d7cd
let getRandomKey = (data) => {
    let keys = Object.keys(data).sort(() => 0.5 - Math.random());
    return (keys.length >= entryAmount) ? keys.slice(0, entryAmount) : keys.slice(0, keys.length)
}
<<<<<<< HEAD
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
=======

let getResolution = () => {
    return bigRes
}
>>>>>>> 19a26738b70e77618556893b774aafad3712d7cd

export {busMap}