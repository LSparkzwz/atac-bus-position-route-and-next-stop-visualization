import '../lib/ol.js'
import {busMapInit} from './init.js'

let busLayer
let linesLayer
let tile
let map
let bigRes = 13.5
let entryAmount = 5

let
    busMap = () => {
        busMapInit()
        tile = new ol.layer.Tile({source: new ol.source.OSM()})
        initMap(tile)
        d3.json("./data/bus_feed.json").then(initDrawData);
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
}

let start = ol.proj.fromLonLat([12.4964, 41.9028])
let end = ol.proj.fromLonLat([12.5074, 41.9028])

let initDrawData = (data) => {
    //we decide to show "entryAmount" random bus routes from the data available
    let randomKeys = getRandomKey(data)
    drawData(data, randomKeys)
}

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
            busStopFeatures = busStopFeatures.concat(getBusStopFeatures(busStops))
            busFeatures = busFeatures.concat(getBusFeatures(buses))
            busLineFeatures = busLineFeatures.concat(getBusLineFeatures(busStops, key + ": " + value[2]))
            busLineFeatures = busLineFeatures.concat(getBustDirectionFeatures(busStops, buses))
        })
    })
    drawBusLines(busLineFeatures)
    drawBusStops(busStopFeatures)
    drawBuses(busFeatures)
}

let getBusStopFeatures = (busStops) => {
    let busStopFeatures = []
    busStops.forEach((busStop) => {
        busStopFeatures.push(
            new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([busStop[3], busStop[2]])),
                name: busStop[1]
            })
        )
    })
    return busStopFeatures
}
let getBusFeatures = (buses) => {
    let busFeatures = []
    buses.forEach((bus) => {
        busFeatures.push(
            new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([bus[1], bus[0]])),
            })
        )
    })
    return busFeatures
}
let getBusLineFeatures = (busStops, entry) => {
    let busLineFeatures = []
    let previousStop
    let lineColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    busStops.forEach((busStop) => {
        if (previousStop !== undefined) {
            start = ol.proj.fromLonLat([previousStop[3], previousStop[2]])
            end = ol.proj.fromLonLat([busStop[3], busStop[2]])
            busLineFeatures.push(
                new ol.Feature({
                    geometry: new ol.geom.LineString([start, end]),
                    lineColor: lineColor,
                    name: entry,
                    isArrow: false,
                })
            )
        }
        previousStop = busStop
    })
    return busLineFeatures
}
//bus direction = arrow that points the direction the autobus is going
//We get this arrow by drawing it starting from the bus position and going to the next stop
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
        busDirectionFeatures.push(
            new ol.Feature({
                geometry: new ol.geom.LineString([start, end]),
                lineColor: 'Red',
                isArrow: true
            })
        )
    })
    return busDirectionFeatures
}

let drawBusStops = (busStopFeatures) => {
    let busStopStyle = new ol.style.Style({
        image: new ol.style.Icon({
            src: './resources/stop.svg',
            scale: 0.4
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
            let zoomVal = Math.min(map.getView().getResolutionForZoom(bigRes) / resolution, 2)
            busStopStyle.getImage().setScale(Math.min(zoomVal, resolution));
            return busStopStyle;
        }
    });

    map.addLayer(busLayer)
}
let drawBuses = (busFeatures) => {
    let busStyle = new ol.style.Style({
        image: new ol.style.Icon({
            src: './resources/bus.svg',
            scale: 0.2
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
            busStyle.getImage().setScale(Math.min(zoomVal, resolution));
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

let getRandomKey = (data) => {
    let keys = Object.keys(data).sort(() => 0.5 - Math.random());
    return (keys.length >= entryAmount) ? keys.slice(0, entryAmount) : keys.slice(0, keys.length)
}

let getResolution = () => {
    return bigRes
}

export {busMap}