let myMap;

// Дождёмся загрузки API и готовности DOM.
ymaps.ready(init);
const div_list = document.getElementById('transport-info__list');
const div_count = document.getElementById('transport-info__text-container');



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
  let coordinates = new Array();
  fetch('http://localhost:63342/transport/js/routes.json')
    .then(response => response.json()) // распарсим строку из тела HTTP ответа как JSON
    .then(routes => {

      const count = document.getElementById('transport-info__counter');
      count.innerHTML = routes.length;

      for (const route of routes) {
        const a = document.createElement('a');
        a.setAttribute("id", "transport-info__route-link");

        const routes_text = document.createElement('h2');
        routes_text.setAttribute("id", "transport-info__routes-text");
        routes_text.innerHTML = route.firstRoute.number + "-" + route.secondRoute.number;

        const type_transport = document.createElement('p');
        type_transport.setAttribute("id", "transport-info__type-transport");
        type_transport.innerHTML = route.firstRoute.type;

        a.appendChild(routes_text);
        a.appendChild(type_transport)
        div_list.appendChild(a);
        //let coordinates = new Array();

        /*for (stop of route.stops){

          coordinates.push([stop.latitude, stop.longitude]);

        }*/


      }
      console.log(routes[5].firstRoute.id);
      for (stop of routes[5].stops){ //МЕНЯТЬ МАРШРУТ ЗДЕСЬ
        coordinates.push([stop.latitude, stop.longitude]);
      }
      console.log(coordinates);
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


    });

  /*myMap.geoObjects
    .add(new ymaps.Placemark([55.790139, 37.814052], {
      hintContent: 'Ну давай уже тащи'
    }, {
      preset: 'islands#circleIcon',
      iconColor:'#735184'
    }))*/


}
