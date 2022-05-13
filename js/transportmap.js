let myMap;
const moscowCenterCoords = [55.76, 37.64]
ymaps.ready(init);
const divCount = document.getElementById('transport-info__text-container');


function init () {
  myMap = new ymaps.Map('transportmap', {
    center: moscowCenterCoords, // Москва
    zoom: 10,
    controls: []
  });

  /*myMap.controls.add('zoomControl', {
    float: 'none',
    position: {
      top: '30px',
      left: '420px'
    }
  });*/
  DataProcessing();
}

function DataProcessing(){

  fetch('http://localhost:63342/transport/js/routes.json')
    .then(response => response.json()) // распарсим строку из тела HTTP ответа как JSON
    .then(routes => {
      fetch('http://localhost:63342/transport/js/heat.json')
        .then(response => response.json()) // распарсим строку из тела HTTP ответа как JSON
        .then(districts => {
          let button = document.getElementById("districts-choice__button");
          button.onclick = () => DisplayDistricts(districts, routes);


        });
      BuildRoutes(routes);

    });



}

function BuildRoutes(routes){
  const parent = document.getElementById('transport-info');
  const divList = document.createElement('div');
  divList.setAttribute('id', 'transport-info__list');
  parent.appendChild(divList);

  const count = document.getElementById('transport-info__counter');
  count.innerHTML = routes.length;
  for (const route of routes) {
    let coordinates = [];

    const a = document.createElement('a');
    a.setAttribute("id", "transport-info__route-link");
    a.href = "#";
    a.onclick = () => FindRoute(route);

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

    for (stop of route.stops){

      coordinates.push([stop.latitude, stop.longitude]);

    }
    DrawRouteOnMap(coordinates, route, true);
  }
}

function DrawRouteOnMap(coordinates, route, isDistrict){
  let col = '#' + getRanHex(6);


  let headerBalloon = route.firstRoute.type +": " + route.firstRoute.number + " - " + route.secondRoute.number;

  let stringBalloon = "Совпадение: " + (route.matchPercentage * 100).toFixed(0) + '%';
  let routeLine = new ymaps.Polyline(
    coordinates,
    {
      balloonContentHeader: headerBalloon,
      balloonContent: stringBalloon,
    }, {
      // Задаем опции геообъекта.
      // Отключаем кнопку закрытия балуна.
      balloonCloseButton: true,
      // Цвет линии.
      strokeColor: col,
      // Ширина линии.
      strokeWidth: 2,
      // Коэффициент прозрачности.
      strokeOpacity: 1
    });
  if (!isDistrict){
    for (let r of route.stops){
      console.log(r.latitude, r.latitude)
      myMap.geoObjects
        .add(new ymaps.Placemark([r.latitude, r.longitude], {
          //hintContent: '1',
          hintContent: r.name
        }, {
          preset: 'islands#circleIcon',
          iconColor: col,
        }))
    }
  }

  myMap.geoObjects.add(routeLine);
}

const getRanHex = size => {
  let result = [];
  let hexRef = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

  for (let n = 0; n < size; n++) {
    result.push(hexRef[Math.floor(Math.random() * 16)]);
  }
  return result.join('');
}

function FindRoute(route){
  //let a = document.getElementsByClassName('transport-info__route-link-cl');
  let coordinates = [];
  for (stop of route.stops){
    coordinates.push([stop.latitude, stop.longitude]);
  }
  const coords = [route.stops[0].latitude, route.stops[0].longitude];
  myMap.geoObjects.removeAll();
  myMap.setCenter(coords);
  myMap.setZoom(13);
  DrawRouteOnMap(coordinates, route);
}

function DisplayDistricts(districts, routes){
  if (!document.getElementById("districts-window"))
  {
    let listPlace = CreateWindow();
    let districtAll = {
      name: "Все районы"
    };

    BuildDistrictsWindow(districtAll, moscowCenterCoords, listPlace, routes);
    let geoCode;
    for (const district of districts) {
      const fullName = district.name + ", Москва";
      geoCode = ymaps.geocode(fullName, {
        results: 1
      }).then(function (res) {
        let firstGeoObject = res.geoObjects.get(0);
        let coords = firstGeoObject.geometry.getCoordinates();
        BuildDistrictsWindow(district, coords, listPlace, routes);
      })
    }
  }

}

function CreateWindow(){
  const parentContainer = document.getElementById('data-container');
  const window = document.createElement('div');
  window.setAttribute("id", "districts-window");

  /*document.addEventListener('click', function(event) {
    let e=document.getElementById('districts-window');
    if (!e.contains(event.target))
      CloseWindow();
  });*/

  //window.innerHTML = "";
  const container = document.createElement('div');
  container.setAttribute("id", "districts-window__container-top");
  const title = document.createElement('h1');
  title.setAttribute("id", "districts-window__title");
  title.innerHTML =  "Выбор района";
  const closeButtonLink = document.createElement('a');
  closeButtonLink.href = "#";
  closeButtonLink.onclick = () => CloseWindow();
  const closeButton = document.createElement('img');
  closeButton.setAttribute("id", "districts-window__cross-but");
  closeButton.src="./img/close.png";
  closeButtonLink.appendChild(closeButton);
  const listPlace = document.createElement('div');
  listPlace.setAttribute("id", "districts-window__list");
  container.appendChild(title);
  container.appendChild(closeButtonLink);
  window.appendChild(container);
  window.appendChild(listPlace);
  parentContainer.appendChild(window);
  return listPlace;
}

function BuildDistrictsWindow(district, coords, listPlace, routes){
  const districtLink = document.createElement('a');
  districtLink.setAttribute("id", "districts-window__district-link");
  districtLink.href = "#";
  districtLink.onclick = () => FindDistrict(coords, district, routes);
  const districtName = document.createElement('h2');
  districtName.setAttribute("id", "districts-window__districts-text");
  districtName.innerHTML = district.name;
  districtLink.appendChild(districtName);
  listPlace.appendChild(districtLink);
}

function CloseWindow(){
  const window = document.getElementById('districts-window');
  window.remove();
}

function FindDistrict(coords, district, routes){
  CloseWindow();
  myMap.geoObjects.removeAll();
  const titleText = document.getElementById("transport-info__title-district");
  titleText.innerHTML = district.name;


  let arr = []
  if (coords !== moscowCenterCoords) {
    setDistrictOnMap(coords);
    for (let searchedRouteInDistrict of district.routePairsId){
      let route = routes.find(r =>
        r.firstRoute.id === searchedRouteInDistrict.item1 &
        r.secondRoute.id === searchedRouteInDistrict.item2 ||
        r.firstRoute.id === searchedRouteInDistrict.item2 &
        r.secondRoute.id === searchedRouteInDistrict.item1)
      arr.push(route);
    }
  }
  else {
    setMap();
    arr = routes;
  }


  const routeElements = document.getElementById('transport-info__list');
  routeElements.remove();
  BuildRoutes(arr);


}

function setDistrictOnMap (coords) {
  myMap.setCenter(coords);
  myMap.setZoom(13);

}

function setMap(){
  myMap.setCenter(moscowCenterCoords);
  myMap.setZoom(10);
}
