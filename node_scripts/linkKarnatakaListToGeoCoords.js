const fetch = require('node-fetch');
const _ = require("lodash")
const fs = require('fs');
const localList = require("./karnatakaList.json")

//
function start(){
  const keys = Object.keys(localList)
  linkWithGeocoords(localList, keys)
  .then(withGeoCoords => handleList(withGeoCoords))
}

start();

function linkWithGeocoords(baseList, keys){
  return new Promise((resolve, reject) => {
    let counter = 0;
    let LIST = [];
    let status = "not_started";
    let retry = 0;
    let totalCall = 0;
    let to = setInterval(() => {
      if(counter > keys.length - 1){
        console.log("################################################################");
        console.log("ALL DONE");
        clearInterval(to);
        resolve(LIST)
      }else{
        const constituency = keys[counter]
        if(status === "not_started"){
          status = "started"
          console.log("Calling for =>", constituency, "Index => ", counter);
          getLocationBasedOnCity(constituency)
          .then(coords => {
            console.log("Coords", coords);
            LIST.push(Object.assign({},{
              constituency,
              location: coords,
              candidates: baseList[constituency],
            }))
            console.log("Fetched Data for => ", constituency);
            console.log(`Doing ${((counter/keys.length)*100).toFixed(1)}%`)
            status = "done"
          }).catch(error => {
            console.log("-----------------------------------------------");
            console.log("Failed for => ", constituency);
            console.log("Attempt: ", retry++);
            console.log(error.status);
            status = "not_started"
          })
        }else if(status === "started"){
          console.log("waiting...", constituency);
        }else if(status === "done"){
          counter += 1;
          retry = 0;
          status = "not_started";
        }
      }
    }, 500);
  })
}

function getLocationBasedOnCity(city){
  return new Promise((resolve, reject) => {
    const gmap = "https://maps.googleapis.com/maps/api/geocode/json?address="
    const key = "AIzaSyDaW8mPN6ZGbLunQcj0k6QhTC_mehLlRdk"
    const finalURL = `${gmap}${city.toLowerCase()}&key=${key}`
    console.log(finalURL);
    fetch(finalURL)
    .then(res1 => res1.json())
    .then(res1 => {
      if(res1 && !res1.error_message){
        var coords = res1.results[0] && res1.results[0].geometry.location
        resolve(coords)
      }else{
        reject(res1)
      }
    })
  })
}

function handleList(list){
  fs.unlink("node_scripts/final2018KA.json", delError => {
     if (delError) throw delError;
     console.log('successfully deleted finalList.json');
     fs.appendFile("node_scripts/final2018KA.json", JSON.stringify(list, null, 4), function (err) {
       if (err) console.error("failed!!");;
       console.log('Total Records : ' + list.length);
       console.log("Saved!");
     });
  })
}
