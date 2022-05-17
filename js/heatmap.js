let myMap;
// Дождёмся загрузки API и готовности DOM.
ymaps.ready(init);
const moscowCenterCoords = [55.76, 37.64];

function init () {
  // Создание экземпляра карты и его привязка к контейнеру с
  // заданным id ("map").
  myMap = new ymaps.Map('heatmap', {
    center: [55.76, 37.64], // Москва
    zoom: 10,
    controls: []
  });
  myMap.options.set('maxZoom', 13);
  myMap.options.set('minZoom', 10);

  myMap.controls.add('zoomControl',{
    float: 'none',
    position: {
      top: '30px',
      left: '430px'
    }
  });
  DataProcessing();
}



function DataProcessing(){

  fetch('http://localhost:63342/transport/js/heat.json')
    .then(response => response.json()) // распарсим строку из тела HTTP ответа как JSON
    .then(districts => {

      ProcessDistricts(districts);
  });
  fetch('http://localhost:63342/transport/js/routes.json')
    .then(response => response.json()) // распарсим строку из тела HTTP ответа как JSON
    .then(routes => {
      const count = document.getElementById('summary__sum-count');
      count.innerHTML = routes.length;
    });
}



function ProcessDistricts(districts) {
  let geoCode;
  let features = [];
  ymaps.modules.require(['Heatmap'], function (Heatmap) {
    let data = [],
      heatmap = new Heatmap();
    //heatmap.options.set('dissipating', true);
    heatmap.setMap(myMap);
    //let newData = [[55.814128, 37.589213]];

    let promise = new Promise(function(resolve, reject) {
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
              weight: district.routePairsCount
            }
          }
          features.push(feature);

          if (features.length === districts.length)
          {
            resolve(features)
          }

        })
      }
    });
    promise.then(res => {
      BuildHtml(res.sort((a, b) => a.properties.weight > b.properties.weight ? -1 : 1));
      DrawHeatMap(res, heatmap);
    });
  });
}


function DrawHeatMap(features, heatmap){
  console.log(features);
  let data = {
    type: 'FeatureCollection',
    features: features
  };
  //console.log(heatmap.getData());
  heatmap.options.set('radius', 40);
  heatmap.options.set('dissipating', true);
  heatmap.options.set('opacity', 0.7);
  heatmap.setData(data);
}

function BuildHtml(features){
  for (let feature of features) {
    const districts_list = document.getElementById('summary_districts');
    const a = document.createElement('a');
    a.href = "#";
    a.style.background = "";
    //a.onclick = setCenter([0,0]);
    a.onclick = () => {
      setDistrictOnMap(feature);
      ChangeDistrictButton(a);
      ReturnToOrigin(a);
    }

    a.setAttribute("class", "summary_district-link");

    const districtName = document.createElement('h2');
    districtName.setAttribute("class", "summary__district-name");
    districtName.innerHTML = feature.id;

    const countText = document.createElement('p');
    countText.setAttribute("class", "summary__text-in-district");
    countText.innerHTML = "Количество совпадающих маршрутов";

    const routesCount = document.createElement('p');
    routesCount.setAttribute("class", "summary__count-in-district");
    routesCount.innerHTML = feature.properties.weight;


    a.appendChild(districtName);
    a.appendChild(countText);
    a.appendChild(routesCount);
    districts_list.appendChild(a);
  }
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

function ChangeDistrictButton (el){
  if (el.style.background === '') {
    el.style.background = "#E9EBEF";
  }
  else{
    el.style.background = "";
    setDefaultParams();
  }
}

function ReturnToOrigin(el){
  let a = document.getElementsByClassName('summary_district-link');
  for (let button of a){
    if (button !== el)
    {
      button.style.background = ""
    }
    //button.style.background = '#FFFFFF';
    //button.classList.add('summary_district-link.hover');

  }

  //console.log(a);
}

function setDefaultParams(){
  myMap.geoObjects.removeAll();
  myMap.setCenter(moscowCenterCoords);
  myMap.setZoom(10);
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

