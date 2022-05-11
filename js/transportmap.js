let myMap;
ymaps.ready(init);
const divList = document.getElementById('transport-info__list');
const divCount = document.getElementById('transport-info__text-container');

function init () {
  myMap = new ymaps.Map('transportmap', {
    center: [55.76, 37.64], // Москва
    zoom: 10,
    controls: []
  });

  myMap.controls.add('zoomControl', {
    float: 'none',
    position: {
      top: '30px',
      left: '420px'
    }
  });
  DataProcessing();
}

function DataProcessing(){

  fetch('http://localhost:63342/transport/js/routes.json')
    .then(response => response.json()) // распарсим строку из тела HTTP ответа как JSON
    .then(routes => {
      let coordinates = BuildRoutes(routes);
      DrawRouteOnMap(coordinates);


    });

  /*myMap.geoObjects
    .add(new ymaps.Placemark([55.790139, 37.814052], {
      hintContent: 'Ну давай уже тащи'
    }, {
      preset: 'islands#circleIcon',
      iconColor:'#735184'
    }))*/

}

function BuildRoutes(routes){
  let coordinates = new Array();

  const count = document.getElementById('transport-info__counter');
  count.innerHTML = routes.length;
  for (const route of routes) {
    const aimCoords = [route.stops[0].latitude, route.stops[0].longitude];
    const a = document.createElement('a');
    a.setAttribute("id", "transport-info__route-link");
    a.href = "#";
    console.log(aimCoords);
    a.onclick = () => FindRoute(aimCoords);

    const routes_text = document.createElement('h2');
    routes_text.setAttribute("id", "transport-info__routes-text");
    routes_text.innerHTML = route.firstRoute.number + "-" + route.secondRoute.number;

    const type_transport = document.createElement('p');
    type_transport.setAttribute("id", "transport-info__type-transport");
    type_transport.innerHTML = route.firstRoute.type;

    const percent = document.createElement('p');
    percent.setAttribute("id", "transport-info__percent");
    let matchPercentage = (route.matchPercentage * 100).toFixed(0);
    percent.innerHTML = matchPercentage + "%"

    a.appendChild(routes_text);
    a.appendChild(type_transport);
    a.appendChild(percent);
    divList.appendChild(a);
    //let coordinates = new Array();

    /*for (stop of route.stops){

      coordinates.push([stop.latitude, stop.longitude]);

    }*/
  }
  for (stop of routes[1].stops){ //МЕНЯТЬ МАРШРУТ ЗДЕСЬ
    coordinates.push([stop.latitude, stop.longitude]);
  }
  return coordinates;
}

function DrawRouteOnMap(coordinates){
  let routeLine = new ymaps.Polyline(
    coordinates,
    {
      balloonContent: "1",//route.firstRoute.number + "-" + route.secondRoute.number,
    }, {
      // Задаем опции геообъекта.
      // Отключаем кнопку закрытия балуна.
      balloonCloseButton: false,
      // Цвет линии.
      strokeColor: "#000000",
      // Ширина линии.
      strokeWidth: 4,
      // Коэффициент прозрачности.
      strokeOpacity: 0.5
    });
  myMap.geoObjects.add(routeLine);
}

function FindRoute(coords){
  myMap.geoObjects.removeAll();
  myMap.setCenter(coords);
  myMap.setZoom(12);
}
