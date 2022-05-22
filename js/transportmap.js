let myMap;
const moscowCenterCoords = [55.76, 37.64];
ymaps.ready(init);
const divCount = document.getElementById('transport-info__text-container');
const allDistricts = "Все районы"


function init () {
  myMap = new ymaps.Map('transportmap', {
    center: moscowCenterCoords, // Москва
    zoom: 10,
    controls: []
  });
  myMap.options.set('minZoom', 10);

  myMap.controls.add('zoomControl', {
    float: 'none',
    position: {
      top: '30px',
      left: '430px'
    }
  });


  DataProcessing();

}

function DataProcessing() {

  fetch('http://localhost:63342/transport/js/routes.json')
    .then(response => response.json()) // распарсим строку из тела HTTP ответа как JSON
    .then(routes => {
      fetch('http://localhost:63342/transport/js/heat.json')
        .then(response => response.json()) // распарсим строку из тела HTTP ответа как JSON
        .then(districts => {
          DefineDistricts(districts).then(modDistricts => {
            setRouteColor(routes).then(modRoutes => {
              SetCheckbox(modDistricts[0], routes);
              BuildRoutes(modRoutes, modDistricts[0])
            }).then(() => {
              let button = document.getElementById("districts-choice__button");
              button.onclick = () => DisplayDistricts(modDistricts, routes);

            })
          })
        })
    })

}

function DisplayAll(chbox, districtObj, routes){
  if (chbox.checked){
    ProcessAllRoutes().then(allRoutes =>
      setRouteColor(allRoutes).then(modRoutes =>
        FindDistrict(districtObj, modRoutes)
      //BuildRoutes(allRoutes, districtObj)
      ))
  }
  else{
    //console.log(routes);
    FindDistrict(districtObj, routes);
    //DisplayAllRoutes(routes, districtObj)

  }

}

function ProcessAllRoutes(){
  return new Promise(function (resolve){
    fetch('http://localhost:63342/transport/js/allroutes.json')
      .then(response => response.json()) // распарсим строку из тела HTTP ответа как JSON
      .then(routes => {
        resolve(routes);
      })
  })
}

function SetCheckbox(districtObj, routes){
  const area = document.getElementById("transport-info__checkbox-area");
  const chbox = document.createElement('input');
  chbox.setAttribute('type', 'checkbox');
  chbox.setAttribute('id', 'checkmark');

  const label = document.createElement('label');
  label.setAttribute('for', 'checkmark');
  label.setAttribute('id', 'transport-info__checkbox-text');
  label.innerHTML = "Показать все маршруты";
  chbox.onclick = () => DisplayAll(chbox, districtObj, routes);

  area.appendChild(chbox);
  area.appendChild(label);


}

function BuildRoutes(routes, district){
  const parent = document.getElementById('transport-info');
  const divList = document.createElement('div');
  divList.setAttribute('id', 'transport-info__list');
  parent.appendChild(divList);

  const count = document.getElementById('transport-info__counter');
  count.innerHTML = routes.length;
  for (const route of routes) {
    let coordinates = [];

    const a = document.createElement('a');
    a.setAttribute("class", "transport-info__route-link");
    a.href = "#";
    a.style.background = '';
    a.onclick = () => {
      setRouteOnMap(route);
      ChangeRouteButton(a, routes, district);
      ReturnToOrigin(a);
    }



    const type_transport = document.createElement('p');
    type_transport.setAttribute("class", "transport-info__type-transport");
    type_transport.innerHTML = route.firstRoute.type;

    a.appendChild(type_transport);
    if (route.matchPercentage !== 0)
    {
      const routes_text = document.createElement('h2');
      routes_text.setAttribute("class", "transport-info__routes-text");
      routes_text.innerHTML = route.firstRoute.number + "-" + route.secondRoute.number;
      a.appendChild(routes_text);
      const percent = document.createElement('p');
      percent.setAttribute("class", "transport-info__percent");
      let matchPercentage = (route.matchPercentage * 100).toFixed(0);
      percent.innerHTML = matchPercentage + "%"
      a.appendChild(percent);
    }
    else{
      const routes_text = document.createElement('h2');
      routes_text.setAttribute("class", "transport-info__routes-text");
      routes_text.innerHTML = route.firstRoute.number;
      a.appendChild(routes_text);
    }

    divList.appendChild(a);
    //let coordinates = new Array();

    for (stop of route.stops){

      coordinates.push([stop.latitude, stop.longitude]);

    }
    DrawRouteOnMap(coordinates, route, true);
  }
}

function ChangeRouteButton (el, routes, district){
  if (el.style.background === '') {
    el.style.background = "#E9EBEF";
  }
  else{
    el.style.background = "";
    DisplayAllRoutes (routes, district);
  }
}

function ReturnToOrigin(el) {
  let a = document.getElementsByClassName('transport-info__route-link');
  for (let button of a) {
    if (button !== el) {
      button.style.background = ""
    }
  }
}

function DrawRouteOnMap(coordinates, route, isDistrict){
  let headerBalloon;
  let stringBalloon;
  if (route.matchPercentage !== 0){
    headerBalloon = route.firstRoute.type +": " + route.firstRoute.number + " - " + route.secondRoute.number;
    stringBalloon = "Совпадение: " + (route.matchPercentage * 100).toFixed(0) + '%';
  }
  else {
    headerBalloon = route.firstRoute.type +": " + route.firstRoute.number;

  }
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
      strokeColor: route.color,
      // Ширина линии.
      strokeWidth: 2,
      // Коэффициент прозрачности.
      strokeOpacity: 1
    });
  if (!isDistrict){
    for (let r of route.stops){
      myMap.geoObjects
        .add(new ymaps.Placemark([r.latitude, r.longitude], {
          //hintContent: '1',
          hintContent: r.name
        }, {
          preset: 'islands#circleIcon',
          iconColor: route.color,
        }))
    }
  }

  myMap.geoObjects.add(routeLine);
}

function setRouteColor(routes){
  return new Promise(function (resolve){
    for (let route of routes) {
      route.color = '#' + getRanHex(6)
    }
    resolve(routes);
  })
}

const getRanHex = size => {
  let result = [];
  let hexRef = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

  for (let n = 0; n < size; n++) {
    result.push(hexRef[Math.floor(Math.random() * 16)]);
  }
  return result.join('');
}

function setRouteOnMap(route){
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
    BuildDistrictsWindow(districts, listPlace, routes);
  }
}

function DefineDistricts (districts){
  return new Promise(function(resolve, reject) {

    let districtsArr = [];
    let districtAll = {
      obj: {
        name: allDistricts
      },
      coords: moscowCenterCoords
    };
    const districtsLength = districts.length + 1;
    districtsArr.push(districtAll);
    //BuildDistrictsWindow(districtAll, moscowCenterCoords, listPlace, routes);
    let geoCode;
    for (const district of districts) {
      const fullName = district.name + ", Москва";
      geoCode = ymaps.geocode(fullName, {
        results: 1
      }).then(function (res) {
        let firstGeoObject = res.geoObjects.get(0);
        let coords = firstGeoObject.geometry.getCoordinates();
        let districtObj = {
          obj: district,
          coords: coords
        }
        districtsArr.push(districtObj);
        if (districtsArr.length === districtsLength)
        {
          resolve(districtsArr.sort((a, b) => a.obj.routePairsCount > b.obj.routePairsCount ? -1 : 1));
        }
        //BuildDistrictsWindow(district, coords, listPlace, routes);
      })
    }
  });
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

function BuildDistrictsWindow(districts, listPlace, routes){
  for (let district of districts){
    const districtLink = document.createElement('a');
    districtLink.setAttribute("id", "districts-window__district-link");
    districtLink.href = "#";
    districtLink.onclick = () => FindDistrict(district, routes);
    const districtName = document.createElement('h2');
    districtName.setAttribute("id", "districts-window__districts-text");
    districtName.innerHTML = district.obj.name;
    districtLink.appendChild(districtName);
    listPlace.appendChild(districtLink);
  }

}

function CloseWindow(){
  const window = document.getElementById('districts-window');
  if (window){
    window.remove();
  }

}

function FindDistrict(districtObj, routes){
  const district = districtObj.obj;
  const coords = districtObj.coords;
  CloseWindow();
  myMap.geoObjects.removeAll();
  const titleText = document.getElementById("transport-info__title-district");
  titleText.innerHTML = district.name;
  let arr = []
  if (coords !== moscowCenterCoords) {
    const chbox = document.getElementById("checkmark");
    const label = document.getElementById("transport-info__checkbox-text");
    chbox.remove();
    label.remove();
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
    setMap(moscowCenterCoords);
    arr = routes;
    if(document.getElementById("checkmark") && routes[0].matchPercentage !== 0)
    {
      const chbox = document.getElementById("checkmark");
      const label = document.getElementById("transport-info__checkbox-text");
      chbox.remove();
      label.remove();
    }
    if(routes[0].matchPercentage !== 0) {
      SetCheckbox(districtObj, routes);
    }

  }

  const routeElements = document.getElementById('transport-info__list');
  routeElements.remove();
  BuildRoutes(arr, districtObj);


}

function DisplayAllRoutes (routes, district){
  myMap.geoObjects.removeAll();
  if (district.coords === moscowCenterCoords) {
    setMap(moscowCenterCoords);
  }
  else
  {
    setDistrictOnMap(district.coords)
  }

  for (let route of routes){
    let coordinates = [];
    for (stop of route.stops){
      coordinates.push([stop.latitude, stop.longitude]);
    }
    DrawRouteOnMap(coordinates, route, true);
  }

}

function setDistrictOnMap (coords) {
  myMap.setCenter(coords);
  myMap.setZoom(13);

}

function setMap(coords){
  myMap.setCenter(coords);
  myMap.setZoom(10);
}
