let myMap;
// Дождёмся загрузки API и готовности DOM.
ymaps.ready(init);

function init () {
  // Создание экземпляра карты и его привязка к контейнеру с
  // заданным id ("map").
  myMap = new ymaps.Map('heatmap', {
    center: [55.76, 37.64], // Москва
    zoom: 10,
    controls: []
  });

  /*myMap.controls.add('zoomControl',{
    float: 'none',
    position: {
      top: '30px',
      left: '420px'
    }
  });*/
  DataProcessing();
}

function DataProcessing(){

  fetch('http://localhost:63342/transport/js/heat.json')
    .then(response => response.json()) // распарсим строку из тела HTTP ответа как JSON
    .then(districts => {

      ProcessDistricts(districts);

      fetch('http://localhost:63342/transport/js/routes.json')
        .then(response => response.json()) // распарсим строку из тела HTTP ответа как JSON
        .then(routes => {
          const count = document.getElementById('summary__sum-count');
          count.innerHTML = routes.length;
        });
  })
}

function ProcessDistricts(districts) {
  let geoCode;
  let features = [];
  ymaps.modules.require(['Heatmap'], function (Heatmap) {
    let data = [],
      heatmap = new Heatmap();
    heatmap.options.set('dissipating', true);
    heatmap.setMap(myMap);

    //let newData = [[55.814128, 37.589213]];

    for (const district of districts) {
      const fullName = district.name + ", Москва";
      geoCode = ymaps.geocode(fullName, {
        results: 1
      }).then(function (res) {
        let firstGeoObject = res.geoObjects.get(0);
        let coords = firstGeoObject.geometry.getCoordinates();
        let feature = {
          id: district.name,
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: coords
          },
          properties: {
            //dissipating: true,
            //radius: 40,
            weight: district.stopsCount
          }
        }
        features.push(feature);
        DrawHeatMap(features, heatmap);
        BuildHtml(feature);

      })
    }

  });
}


function DrawHeatMap(features, heatmap){
  let data = {
    type: 'FeatureCollection',
    features: features
  };
  //console.log(heatmap.getData());
  heatmap.setData(data);
}

function BuildHtml(feature){
  const districts_list = document.getElementById('summary_districts');
  const a = document.createElement('a');
  a.href = "#";
  //a.onclick = setCenter([0,0]);
  a.onclick = () => setDistrictOnMap(feature);
  a.setAttribute("id", "summary_district-link");

  const districtName = document.createElement('h2');
  districtName.setAttribute("id", "summary__district-name");
  districtName.innerHTML = feature.id;

  const countText = document.createElement('p');
  countText.setAttribute("id", "summary__text-in-district");
  countText.innerHTML = "Количество совпадающих маршрутов";

  const routesCount = document.createElement('p');
  routesCount.setAttribute("id", "summary__count-in-district");
  routesCount.innerHTML = feature.properties.weight;


  a.appendChild(districtName);
  a.appendChild(countText);
  a.appendChild(routesCount);
  districts_list.appendChild(a);
}

function setDistrictOnMap (feature) {
  myMap.geoObjects.removeAll();
  myMap.setCenter(feature.geometry.coordinates);
  myMap.setZoom(12);
  myMap.geoObjects
    .add(new ymaps.Placemark(feature.geometry.coordinates, {
      iconCaption: feature.id
    }, {
      preset: 'islands#icon',
      iconColor:'#bc4000'
    }))
}



async function ProcessDistrictsAsync (districts) {
  let geoCode;
  let features = [];
  for (const district of districts) {
    const fullName = district.name + ", Москва";
    //console.log("+");
    geoCode = await ymaps.geocode(fullName, {
      results: 1
    }).then(function (res) {
      let firstGeoObject = res.geoObjects.get(0);
      let coords = firstGeoObject.geometry.getCoordinates();
      let feature = {
        id: district.name,
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coords
        },
        properties: {
          weight: district.routePairsCount
        }
      }
      features.push(feature);
      return feature;
      //console.log(features);
    })
  }
  console.log(features.length);
  return features;

}

