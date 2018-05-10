/*
Coded By: Raman Choudhary
*/
const host = window.location.origin;
// Step 1: Get MP Data
function getMPData(){
  return fetch("./data/final2018KA.json")
  .then(res => res.json())
  .catch(err => handleError)
}

function getModalAndInject(list){
  return new Promise(function(resolve, reject) {
    fetch("./partials/allowLocation.html")
    .then(res => res.text())
    .then(html => {
      console.log(html);
      $(".modal_wrap").append(html)
      resolve(list)
    })
    .catch(err => {
      console.error("Failed to Loaded Location Modal");
      reject(err)
    })
  });
}

// Step 2: Show why Permission is Needed
function whyLocationIsNeeded(list){
  return new Promise((resolve, reject) => {
    $('.location_modal').modal('show')

    $(".location_modal").on('hide.bs.modal', () => {
      resolve(list)
    })
  })
}

// Step 2: Get User Location
function getUserLocation(list){
  return new Promise((resolve, reject) => {
    if (window.navigator) {
      window.navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log(pos);
          resolve({
            list,
            coords: pos.coords
          })
        }, (error) => {
          // try to get location based on IP
          getLocationFromIP()
          .then(res => {
            resolve({
              list,
              coords: {
                latitude: res.location.lat,
                longitude: res.location.lng,
              }
            })
          })
        })
    } else {
      reject({error: "No Location available"})
    }
  })
}

function getNearestMP(payload){
  return new Promise(function(resolve, reject) {
    const list = payload.list
    window.list = list
    const coords = payload.coords
    if(coords && list){
      const nearestConsti = findNearestMP(coords.latitude, coords.longitude, list)
      console.log(nearestConsti);
      resolve(nearestConsti)
    }else {
      reject({error: "No list or coords available"})
    }
  });
}

function getLocationFromIP(){
  const KEY = "AIzaSyBq-jMCPwSN0LMAZZ-wwl82mKwvuEhsRL0"
  return fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${KEY}`, { method: "POST" })
  .then(res => res.json())
}


function handleError(error){
  console.error(error);
}

function renderUI(payload){
  const candidates = payload.candidates
  const constituency = payload.constituency
  const header = `
    <div class="header">
      <h1>Your constituency is : ${constituency}</h1>
      <h3>Total <strong>${candidates.length}</strong> candidates contesting election in your area.</h3>
    </div>
  `
  const sidebar = `
    <div class="sidebar">
      <h1>Sidebar</h1>
    </div>
  `

  const renderCase = function(cases){
    const pCase = parseInt(cases)
    if (pCase === 0){
      return "good"
    }else if (pCase === 1){
      return "ok"
    } else if (pCase > 1){
      return "bad"
    }

  }
  if(candidates && candidates.length > 0){
    const netaListHtml = candidates.reduce((html, neta) => {
      const newHtml = `
        <div class="neta-card ${renderCase(neta.criminalCase)}">
          <div class="party-wrap">
            ${renderPartyIcon(neta.party)}
            <h6>${neta.party}</h6>
          </div>
          <div class="details-wrap">
            <div class="info">
              <label>Candidate Name</label>
              <p>${neta.name}</p>
            </div>
            <div class="info">
              <label>Age</label>
              <p>${neta.age}</p>
            </div>
            <div class="info">
              <label>Education</label>
              <p>${neta.education}</p>
            </div>
            <div class="info">
              <label>Criminal Cases</label>
              <span class="cc ${renderCase(neta.criminalCase)}">${neta.criminalCase}</span>
            </div>
            <div class="info">
              <label>Total Assets</label>
              ${neta.asset}
            </div>
            <div class="info">
              <label>Total Liabilities</label>
              ${neta.liabilities}
            </div>
          </div>

        </div>
      `
      return html += newHtml
    }, html = "")

    const $NetaListWrap = document.querySelector(".neta-list-wrap")
    const wrappedHTMl = `
      <div class="container">
        <div class="row">
          <div class="col-md-12">
            ${header}
          </div>
        </div>
        <div class="row">
          <div class="col-sm-12">
            <div class="neta-list">
              ${netaListHtml}
            </div>
          </div>
        </div>
      </div>
    `
    $NetaListWrap.innerHTML = wrappedHTMl
  }
}

function bootstrap(){
  getMPData()
  .then(getModalAndInject)
  .then(whyLocationIsNeeded)
  .then(getUserLocation)
  .then(getNearestMP)
  .then(renderUI)
  .catch(handleError)
}

bootstrap();




// HELPERS

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

function findNearestMP(clientLat, clientLag, mpList){
  let smallestDis, closeMP;
  mpList.map((x) => {
    if(x.location && x.location.lat && x.location.lng){
      const dis = parseInt(distance(clientLat, clientLag, x.location.lat, x.location.lng));
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

function renderPartyIcon(party){
  console.log("Party", party);
  let src = null
  if(party.toLowerCase().trim() === "bjp"){
    src = `${host}/images/party/bjp.jpg`
  }else if(party.toLowerCase().trim() === "inc"){
    src = `${host}/images/party/inc.png`
  }else if(party.toLowerCase().trim() === "all india anna dravida munnetra kazhagam" ){
    src = `${host}/images/party/AIADMK.jpg`
  }else if(party.toLowerCase().trim() === "ind"){
    src = `${host}/images/party/indi.png`
  }else if(party.toLowerCase().trim() === "aam aadmi party"){
    src = `${host}/images/party/aap.jpg`
  }else if(party.toLowerCase().trim() === "tdp"){
    src = `${host}/images/party/tdp.jpg`
  }else if(party.toLowerCase().trim() === "jharkhand mukti morcha"){
    src = `${host}/images/party/jmm.png`
  }else if(party.toLowerCase().trim() === "all india trinamool congress"){
    src = `${host}/images/party/aitc.jpg`
  }else if(party.toLowerCase().trim() === "telangana rashtra samithi"){
    src = `${host}/images/party/trs.jpg`
  }else if(party.toLowerCase().trim() === "communist party of india"){
    src = `${host}/images/party/cpm.jpg`
  }else if(party.toLowerCase().trim() === "all india n.r. congress"){
    src = `${host}/images/party/op1.png`
  }else if(party.toLowerCase().trim() === "jammu and kashmir national conference"){
    src = `${host}/images/party/jkm.jpg`
  }else if(party.toLowerCase().trim() === "rashtriya lok samta party"){
    src = `${host}/images/party/op2.jpg`
  }else if(party.toLowerCase().trim() === "jammu and kashmir national conference"){
    src = `${host}/images/party/jkm.jpg`
  }else if(party.toLowerCase().trim() === "republican sena"){
    src = `${host}/images/party/rpi.jpg`
  }else if(party.toLowerCase().trim() === "jd(s)"){
    src = `${host}/images/party/jds.png`
  }else if(party.toLowerCase().trim() === "sdpi"){
    src = `${host}/images/party/sdpi.jpg`
  }else if(party.toLowerCase().trim() === "akhil bharat hindu mahasabha"){
    src = `${host}/images/party/abhm.jpg`
  }else if(party.toLowerCase().trim() === "all india mahila empowerment party"){
    src = `${host}/images/party/aime.png`
  }else{
    src = `${host}/images/party/noops.svg`
  }
  return `<img src=${src} alt=${party} />`
}
