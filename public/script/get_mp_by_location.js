var LIST = [];
var isAutosuggestInti = false;
const host = window.location.origin;


(function(){
  // Load MP LIST
  fetch('./../data/2014/list.0.1.json')
  .then(mpListRes => mpListRes.json())
  .then(mpListRes => {
    // get User location
    LIST = _.unionBy(mpListRes, "profileId");

    if(window.location.hash === ""){
      console.log("FETCH FROM location");
      window.navigator.geolocation.getCurrentPosition(
        (pos) => {
          var nearestMP = getNearestMP(pos.coords.latitude, pos.coords.longitude, LIST);
          renderCard(nearestMP)
        }, (error) => {
          alert("Can't do much without location")
        })
    }else{
      console.log("FETCH FROM ID")
      renderCard(getMPById(window.location.hash.replace("#","")))
    }
  })

  // Smooth scroll
  $(window).on("scroll", () => {
    $("#map").css({ top: `${$(window).scrollTop()/2}px` })
  })

  // prevent form from submitting
  $(".search_form").on("submit", (e) => {
    e.preventDefault();
  })
})(window, $)



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
    const profession = $(fullInfoText).find("#ContentPlaceHolder1_DataGrid2 > tbody > tr > td > font > table > tbody > tr:nth-child(12) > td.griditem2").text()
    const sons = $(fullInfoText).find("#ContentPlaceHolder1_DataGrid2 > tbody > tr > td > font > table > tbody > tr:nth-child(9) > td.griditem2").text()
    const daughter = $(fullInfoText).find("#ContentPlaceHolder1_DataGrid2 > tbody > tr > td > font > table > tbody > tr:nth-child(10) > td.griditem2").text()
    const totalKids = parseInt(sons || 0) + parseInt(daughter || 0);
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

        ${renderPersonalInfo(Object.assign({}, mp, {
          profession: profession,
          kids: totalKids,
        }))}
        ${renderPerticipation(mp)}
        ${renderBlood(mp)}
        ${renderFinanace(mp)}

        <main class="details">
          <div class="full_info">
            <h5>Full Info</h5>
            <div class="row">
              <div class="col-sm-12">
                <div class="padd_it">
                  ${fullInfoText}
                </div>
              </div>
            </div>
          </div>

          <div class="others">
            <h5>Stats</h5>
          </div>
        </main>
        <div class="padd_it">
          <div id="disqus_thread"></div>
        </div>
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

    calculateMPRating(mp)

    if(!isAutosuggestInti){
      $('#search-autocomplete').autocomplete({
          lookupLimit: 10,
          beforeRender: () => {
            isAutosuggestInti = true
          },
          lookup: (q, done) => {
            const results = LIST
            .filter(x => {
              const mat = x.name.toLowerCase().indexOf(q.toLowerCase()) > -1 ||
              x.con.toLowerCase().indexOf(q.toLowerCase()) > -1
              return mat
            })
            .map(x => { return { value: `${x.name} (${x.con})`, data: `${x.profileId}` }})
            done({
              suggestions: results,
            })
          },
          onSelect: function (suggestion) {
            window.location.hash = "#" + suggestion.data;
            const selectedMP = getMPById(suggestion.data)
            renderCard(selectedMP)
            console.log(selectedMP);
          }
      });
    }
  })
}


function renderPersonalInfo(mp){
  return `
    <div class="section personal">
      <div class="title_wrap">
        <div class="icon">
          <img src="${host}/images/icons/profile.png" alt="profile" />
        </div>
        <h4>Personal Information</h4>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <div class="key_val_list">
            <p>
              <span>Age</span>
              <span>${mp.Age || "N/A"}</span>
            </p>
            <p>
              <span>Gender</span>
              <span>${mp.Gender || "N/A"}</span>
            </p>
            <p>
              <span>Education</span>
              <span>${mp["Educational qualifications"] || "N/A"} (${mp["Educational qualifications - details"] || "N/A"})</span>
            </p>
            <p>
              <span>Profession</span>
              <span>${mp.profession || "N/A"}</span>
            </p>
            <p>
              <span>Children</span>
              <span>${mp.kids || "N/A"}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderPerticipation(mp){
  return `
  <div class="section participation">
    <div class="title_wrap">
      <div class="icon">
        <img src="${host}/images/icons/part.png" alt="profile" />
      </div>
      <h4>Participetion in Lok Sabha</h4>
    </div>
    <div class="row">
      <div class="col-sm-12">
        <div class="key_val_list">
          <p>
            <span>Attendance</span>
            <span>${mp.Attendance || "N/A"} ${attendanceCompare(mp)}</span>
          </p>
          <p>
            <span>Denates</span>
            <span>${mp.Debates || "0"} ${debateCompare(mp)}</span>
          </p>
          <p>
            <span>Questions Asked</span>
            <span>${mp.Questions || "N/A"}</span>
          </p>
          <p>
            <span>Private Member Bill</span>
            <span>${mp["Private Member Bills"] || "0"}</span>
          </p>
          <p>
            <span>Term</span>
            <span>${mp["No. of Term"] || "N/A"}</span>
          </p>

        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-12">
        <div class="notes">
          <p class="text-muted text-note">${mp["Notes"]}</p>
        </div>
      </div>
    </div>
  </div>
  `
}


function renderBlood(mp){

  let renderCaseStat = () => {
    return `
        <p>
          <span>Convicted</span>
          <span>Some Number</span>
        </p>
        <p>
          <span>Convicted</span>
          <span>Some Number</span>
        </p>
        <p>
          <span>Convicted</span>
          <span>Some Number</span>
        </p>
    `
  }
  return `
  <div class="section blood">
    <div class="title_wrap">
      <div class="icon">
        <img src="${host}/images/icons/criminal.png" alt="profile" />
      </div>
      <h4>Criminal Records</h4>
    </div>
    <div class="row">
      <div class="col-sm-12">
        <div class="key_val_list">
          <p>
            <span>Criminal Cases</span>
            <span>${mp.crimalCase || "N/A"}</span>
          </p>
          ${(parseInt(mp.crimalCase) != 0) ? renderCaseStat() : "" }
        </div>
      </div>
    </div>
  </div>
  `
}


function renderFinanace(mp) {
  return `
  <div class="section finance">
    <div class="title_wrap">
      <div class="icon">
        <img src="${host}/images/icons/fin.png" alt="profile" />
      </div>
      <h4>Finance</h4>
    </div>
    <div class="row">
      <div class="col-sm-12">
        <div class="key_val_list">
          <p>
            <span>Total Assets</span>
            <span>${mp["totalAssets"] || "N/A"}</span>
          </p>
          <p>
            <span>Total Liabilities</span>
            <span>${mp["liabilities"] || "N/A"}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
  `
}

function attendanceCompare(mp){
  let nationAvgDif = (parseInt(mp.Attendance.replace("%", "")) || 0) - parseInt(mp["National Attendance average"].replace("%", ""))
  let stateDif = (parseInt(mp.Attendance.replace("%", "")) || 0) - parseInt(mp["State's Attendance average"].replace("%", ""))

  if(mp.Attendance === "N/A"){
    return ""
  }
  
  return `
    (
      <strong>
        <span>
          <span class="${nationAvgDif >= 0 ? "text-success" : "text-danger"}">
          ${nationAvgDif}%
          ${nationAvgDif >= 0 ? "Greater than national average"  : "Lower than national average"}
          </span> and
          <span class="${stateDif >= 0 ? "text-success" : "text-danger"}">
          ${stateDif}%
          ${stateDif > 0 ? "Greater than state average"  : "Lower than state average"}
          </span>
        </span>
      </strong>
    )
  `
}

function debateCompare(mp){
  let nationAvgDif = (parseInt(mp.Debates || 0) / parseInt(mp["National Debates average"])) *  100
  let stateDif = parseInt(mp.Debates || 0) - parseInt(mp["State's Attendance average"])
  if(mp.Debates === "N/A"){
    return ""
  }
  return `
      <strong>(
        <span>
          <span class="${nationAvgDif > 0 ? "text-success" : "text-danger"}">
          ${nationAvgDif.toFixed(1)}%
          ${nationAvgDif > 0 ? "Greater than nation average"  : "Lower than nation average"}
          </span> and
          <span class="${stateDif > 0 ? "text-success" : "text-danger"}">
          ${stateDif}%
          ${stateDif > 0 ? "Greater than state average"  : "Lower than state average"}
          </span>
        </span>
      )</strong>
  `
}


function getMPById(id){
  if(!LIST){
    throw "No List available"
  }else{
    const mp = LIST.filter(x => parseInt(x.profileId) === parseInt(id))
    return mp[0]
  }
}

function calculateMPRating(mp){
  let points = 0;
  function allot(p){ points = points + p }

  // Attendance points
  let attendance = parseInt(mp.Attendance.replace("%",""))
  if(attendance >= 60 && attendance <= 65){ allot(1) }
  else if(attendance >= 65 && attendance <= 70){ allot(2) }
  else if(attendance >= 70 && attendance <= 75){ allot(3) }
  else if(attendance >= 75 && attendance <= 80){ allot(4) }
  else if(attendance >= 80 && attendance <= 85){ allot(5) }
  else if(attendance >= 85 && attendance <= 90){ allot(6) }
  else if(attendance >= 90 && attendance <= 95){ allot(7) }
  else if(attendance > 95){ allot(10) }

  // Debates points

  console.log("----->>", points);
}
