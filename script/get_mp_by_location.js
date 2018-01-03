(function(){
  console.log("Loaded");

  // Load MP LIST
  fetch('./../data/mp_list_location_16.json')
  .then(mpListRes => mpListRes.json())
  .then(mpListRes => {
    // get User location
    window.navigator.geolocation.getCurrentPosition(
      (pos) => {
        var nearestMP = getNearestMP(pos.coords.latitude, pos.coords.longitude, mpListRes.mp_list);
        renderCard(nearestMP)
      }, (error) => {
        alert("Can't do much without location")
      })
  })
})(window)


function distance(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function getNearestMP(clientLat, clientLag, mpList){
  let smallestDis, closeMP;
  mpList.map((x) => {
    if(x.coords){
      const dis = parseInt(distance(clientLat, clientLag, x.coords.lat, x.coords.lng));
      if(!smallestDis){
        smallestDis = dis;
        closeMP = x;
      }else if(smallestDis > dis){
        smallestDis = dis;
        closeMP = x;
      }
    }
  });
  return closeMP;
}

function renderCard(mp){
  const html = `
    <div class="card">
      <p>
        <span>Name</span>
        <span> ${mp.name} </span>
      </p>
      <p>
        <span>Party</span>
        <span> ${mp.party} </span>
      </p>
      <p>
        <span>Location</span>
        <span> ${mp.con} </span>
      </p>
    </div>
  `
  const $card = document.querySelector('#card')
    console.log("called", mp);
    // Create a map object and specify the DOM element for display.
    var map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: mp.coords.lat, lng: mp.coords.lng},
      zoom: 10
    });

    var marker = new google.maps.Marker({
          position: mp.coords,
          map: map,
          title: 'Hello World!'
        });

  $card.innerHTML = html
}
