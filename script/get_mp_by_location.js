(function(){
  // Load MP LIST
  fetch('./../data/2014/list.0.1.json')
  .then(mpListRes => mpListRes.json())
  .then(mpListRes => {
    // get User location
    window.navigator.geolocation.getCurrentPosition(
      (pos) => {
        var nearestMP = getNearestMP(pos.coords.latitude, pos.coords.longitude, mpListRes);
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
    if(x.lat && x.lng){
      const dis = parseInt(distance(clientLat, clientLag, x.lat, x.lng));
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
  console.log(mp);
  // get MP full info
  fetch(`./../data/2014/html/${mp.profileId}.html`)
  .then(res => res.text())
  .then(fullInfoText => {
    const html = `
      <div class="card">
        <div id="google_translate_element"></div>
        <h1 class="nmp">Nearest Lok Sabha member is <span>${mp.name}</span></h1>
        <div class="basic-info">
          <div class="img_wrap">
            <img src="./images/mps/${mp.profileId}.jpg" alt="${mp.name}" class="img-responsive img-circle" />
          </div>
          <div class="bi_wrap">
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
          <div class="contact_wrap">
            <button class="btn btn-success">Contact</button>
          </div>
        </div>

        <div class="section">
          <div class="row">
            <div class="col-sm-12">
              <div class="sec_title">
                Participation on Lok Sabha
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-2">
              <div class="stat">
                <h6>Attendance</h6>
                <h4>${mp.Attendance || "N/A"}</h4>
              </div>
            </div>

            <div class="col-sm-2">
              <div class="stat">
                <h6>Debates</h6>
                <h4>${mp.Debates || "0"}</h4>
              </div>
            </div>

            <div class="col-sm-2">
              <div class="stat">
                <h6>Questions</h6>
                <h4>${mp.Questions || "0"}</h4>
              </div>
            </div>
            <div class="col-sm-2">
              <div class="stat">
                <h6 title="Private Member Bill">PMB</h6>
                <h4>${mp["Private Member Bills"] || "0"}</h4>
              </div>
            </div>
            <div class="col-sm-2">
              <div class="stat">
                <h6>No. of term</h6>
                <h4>${mp["No. of Term"] || "N/A"}</h4>
              </div>
            </div>

          </div>

          <div class="row">
            <div class="col-sm-12">
              <div class="notes">
                <p class="text-muted text-small">${mp["Notes"]}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="row">
            <div class="col-sm-12">
              <div class="sec_title">
                Finance
              </div>
            </div>
          </div>
          <div class="row">
            <table class="table">
              <thead>
                <tr>
                  <td>
                    Total Assets
                  </td>
                  <td>
                    Liabilities Assets
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${mp["totalAssets"] || "N/A"}</td>
                  <td>${mp["liabilities"] || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="row">
            <div class="col-sm-12">
              <div class="notes">
                <p class="text-muted text-small">${mp["Notes"]}</p>
              </div>
            </div>
          </div>
        </div>

        <main class="details">
          <div class="full_info">
            <h5>Full Info</h5>
            ${fullInfoText}
          </div>

          <div class="others">
            <h5>Stats</h5>
          </div>
        </main>
        <div id="disqus_thread"></div>
      </div>
    `

    const $card = document.querySelector('#card')
      // Create a map object and specify the DOM element for display.
      var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: mp.lat, lng: mp.lng},
        disableDefaultUI: true,
        gestureHandling: 'cooperative',
        zoom: 11
      });

      var marker = new google.maps.Marker({
            position: { lat: mp.lat, lng: mp.lng},
            map: map,
            title: mp.con,
          });

    $card.innerHTML = html

    window.location = `#${mp.profileId}`
    var disqus_config = function () {
    this.page.url = window.location.href;  // Replace PAGE_URL with your page's canonical URL variable
    this.page.identifier = `mp_profile_${mp.profileId}`; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
    };
    (function() { // DON'T EDIT BELOW THIS LINE
    var d = document, s = d.createElement('script');
    s.src = 'https://neta-watch.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
    })();

  })
}
