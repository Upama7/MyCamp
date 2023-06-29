mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'cluster-map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-103.5917, 40.6699],
    zoom: 3
});


map.addControl(new mapboxgl.NavigationControl());


console.log(campgrounds);
 
map.on('load', () => {
    
    map.addSource('campgrounds', {
        type: 'geojson',
        data: campgrounds,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
});
 
map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'campgrounds',
    filter: ['has', 'point_count'],
    paint: {

    'circle-color': [
    'step',
    ['get', 'point_count'],
    'red',
    5,
    'orange',
    10,
    'yellow'
    ],
    'circle-radius': [
    'step',
    ['get', 'point_count'],
    15,
    5,
    20,
    10,
    25
    ]
    }
});
 
map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'campgrounds',
    filter: ['has', 'point_count'],
    layout: {
    'text-field': ['get', 'point_count_abbreviated'],
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12
    }
    });
    
    map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'campgrounds',
    filter: ['!', ['has', 'point_count']],
    paint: {
    'circle-color': '#11b4da',
    'circle-radius': 8,
    'circle-stroke-width': 5,
    'circle-stroke-color': '#11b4da'
    }
    });
    
    // inspect a cluster on click
    map.on('click', 'clusters', (e) => {
    const features = map.queryRenderedFeatures(e.point, {
    layers: ['clusters']
    });
    const clusterId = features[0].properties.cluster_id;
    map.getSource('campgrounds').getClusterExpansionZoom(
    clusterId,
    (err, zoom) => {
    if (err) return;
    
    map.easeTo({
    center: features[0].geometry.coordinates,
    zoom: zoom
    });
    }
    );
});
 

map.on('click', 'unclustered-point', (e) => {
    // console.log("UNCLUSTERED POINT CLICKED!!!")
    // const {popUpMarkup} = e.features[0].properties;
    const popText = `<a href="/campgrounds/${e.features[0].properties.id}">${e.features[0].properties.title}</a>`;
    const coordinates = e.features[0].geometry.coordinates.slice();
 
    

    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    
    new mapboxgl.Popup()
    .setLngLat(coordinates)
    .setHTML(popText)
    .addTo(map);
});
 
map.on('mouseenter', 'clusters', () => {
// console.log("MOUSING OVER A CLUSTER")
    map.getCanvas().style.cursor = 'pointer';
});
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });
});