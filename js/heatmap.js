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

  myMap.controls.add('zoomControl',{
    float: 'none',
    position: {
      top: '30px',
      left: '420px'
    }
  });

  ymaps.modules.require(['Heatmap'], function (Heatmap) {
    let data = {
        type: 'FeatureCollection',
        features: [{
          id: 'id1',
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [55.76, 37.64]
          },
          properties: {
            weight: 1
          }
        }, {
          id: 'id2',
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [55.763, 37.64]
          },
          properties: {
            weight: 50
          }
        }]
      },
      heatmap = new Heatmap(data);
    heatmap.setMap(myMap);
  });


}
