const fetch = require('node-fetch');
const cheerio = require('cheerio');
const _ = require("lodash")
const fs = require('fs');
const localList = require("./karnatakaList.json")

const BaseUrl = "http://myneta.info/karnataka2018/"
process.env.NODE_ENV = "development"
let FetchingList = []
let FetchedList = []
let isDone = false



// Step 1
function getConstList(){
  return new Promise((resolve, reject) => {
    fs.readFile("node_scripts/karnatakaList.html", "utf8", (error, data) => {
      if(error){
        reject (error)
      } else {
        try {
          const constList = []
          const $ = cheerio.load(data)
          $(".items a").map((index, row) => {
            constList.push({
              constituency: row && $(row).text(),
              url:  $(row).attr("href")
            })
          })
          FetchedList = constList
          resolve(constList)
        } catch (e) {
          reject(e)
        }
      }
    })
  })
}

// Step 2 Get Basic info
function goToContiSection(lllll) {
  return new Promise((resolve, reject) => {
    const env = process.env.NODE_ENV
    const baseList = lllll
    const url = "http://myneta.info/karnataka2018"
    let counter = 0;
    let LIST = [];
    let pending = "not_started";
    let retry = 0;
    let totalCall = 0;
    let to = setInterval(() => {
      if(counter > baseList.length - 1){
        console.log("################################################################");
        console.log("ALL DONE");
        clearInterval(to);
        resolve(LIST)
      }else{
        let mp = baseList[counter];
        if(pending === "not_started"){
          pending = "started"
          console.log("Calling for =>", mp.constituency);
          fetchListOfCandi(`${url}/${mp.url}`, mp.constituency)
          .then(candidates => {
            LIST.push(candidates)
              console.log("Fetched Data for => ", mp.constituency);
              console.log(`Doing ${((counter+1/baseList.length)*100).toFixed(1)}%`)
              pending = "done"
          }).catch(error => {
            console.log("-----------------------------------------------");
            console.log("Failed for => ", mp.constituency);
            console.log("Attempt: ", retry++);
            console.log(error.status);
            pending = "not_started"
          })
        }else if(pending === "started"){
          const perc = `${((counter/baseList.length)*100).toFixed(1)}%`
          console.log("waiting...", mp.constituency, "Done :", perc);
        }else if(pending === "done"){
          counter += 1;
          retry = 0;
          pending = "not_started";
        }
      }
    }, 300);
  })
}

function fetchListOfCandi(url, constituency){
  return new Promise((resolve, reject) => {
    console.log("fetching...", url);
    fetch(url)
    .then(res => res.text())
    .then((res) => {
      getCandidateList(res, constituency)
      .then(candi => {
        console.log("Done...");
        resolve(candi)
      })
    })
    .catch(err => {
      reject(err)
      console.error(err)
    })
  })

}

// Step 3 get All Condidates
function getCandidateList(dom, constituency){
  return new Promise((resolve, reject) => {
    try {
      console.log("Fetched..", constituency);
      const LIST = []
      const $ = cheerio.load(dom)
      const table = $("#table1 tr");
      table && table.map((index, row) => {
        const name = $(row).find("td:nth-child(1) a").text()
        const url = $(row).find("td:nth-child(1) a").attr("href")
        const party = $(row).find("td:nth-child(2)").text()
        const criminalCase = $(row).find("td:nth-child(3)").text()
        const education = $(row).find("td:nth-child(4)").text()
        const age = $(row).find("td:nth-child(5)").text()
        const asset = $(row).find("td:nth-child(6)").html()
        const liabilities = $(row).find("td:nth-child(7)").html()
        if( name != "" && url ){
          LIST.push({
            name,
            url,
            party,
            criminalCase,
            education,
            age,
            asset,
            liabilities,
            constituency: capitalizeFirstLetter(constituency),
          })
        }
      })
      resolve(LIST)
    }catch (e) {
      reject(e)
    }
  })
}

function handleList(list){
  console.log(list);
  fs.unlink("node_scripts/karnatakaList.json", delError => {
     if (delError) throw delError;
     console.log('successfully deleted finalList.json');
     fs.appendFile("node_scripts/karnatakaList.json", JSON.stringify(list, null, 4), function (err) {
       if (err) console.error("failed!!");;
       console.log('Total Records : ' + list.length);
       console.log("Saved!");
     });
  })
}

function start() {
  // getConstList()
  // .then(goToContiSection)
  // .then(handleList)
  // .catch(err => {
  //   console.log("Error => ", err);
  // })

  const cleanList = _.groupBy(
    _.flatten(localList), "constituency"
  )
}


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

start();

function linkWithGeocoords(baseList){
  return new Promise((resolve, reject) => {
    let counter = 0;
    let LIST = [];
    let pending = "not_started";
    let retry = 0;
    let totalCall = 0;
    let to = setInterval(() => {
      if(counter > baseList.length - 1){
        console.log("################################################################");
        console.log("ALL DONE");
        clearInterval(to);
        resolve(LIST)
      }else{
        let mp = baseList[counter];
        if(pending === "not_started"){
          pending = "started"
          console.log("Calling for =>", mp.name);
          getLocationBasedOnCity(mp.con)
          .then(coords => {
            LIST.push(Object.assign({}, mp, coords))
              console.log("Fetched Data for => ", mp.name);
              console.log(`Doing ${((counter/baseList.length)*100).toFixed(1)}%`)
              pending = "done"
          }).catch(error => {
            console.log("-----------------------------------------------");
            console.log("Failed for => ", mp.name);
            console.log("Attempt: ", retry++);
            console.log(error.status);
            pending = "not_started"
          })
        }else if(pending === "started"){
          console.log("waiting...", mp.name);
        }else if(pending === "done"){
          counter += 1;
          retry = 0;
          pending = "not_started";
        }
      }
    }, 100);
  })
}

function getLocationBasedOnCity(city){
  return new Promise((resolve, reject) => {
    const gmap = "https://maps.googleapis.com/maps/api/geocode/json?address="
    const key = "AIzaSyDyJhcHF_VWFRdulWCUJLFdoPbxdlU0r0k"
    fetch(`${gmap}${city.toLowerCase()}&key=${key}`)
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
