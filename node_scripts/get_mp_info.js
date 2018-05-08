const fetch = require('node-fetch');
const cheerio = require('cheerio');
const _ = require("lodash")
const fs = require('fs');

const lokSabhaUrl = "http://164.100.47.194/Loksabha/Members/AlphabeticalList.aspx"
const bloodMoneyUrl = "http://myneta.info/ls2014/index.php?action=show_winners&sort=default"
const stats = require("./../public/data/2014/stats.0.5.json")

function createBaseListFromLokSabha() {
  return new Promise((resolve, reject) => {
    fetch(lokSabhaUrl)
    .then(res => res.text())
    .then(res => {
      const $ = cheerio.load(res);
      var $tableEl = $(".member_list_table tbody tr");
      var baseList = []
      $tableEl.each((i, el) => {
      	var photoURL = $(el).find('td:nth-child(2)').find('img').attr('src');
        var name = $(el).find('td:nth-child(2)').text();
      	var party = $(el).find('td:nth-child(3)').text();
        var con = $(el).find('td:nth-child(4)').text().replace(/ *\([^)]*\) */g, "");
        var profileURL = $(el).find('td:nth-child(2)').find('a').attr('href')
        baseList.push({
          name: name.trim(),
          photoURL : photoURL.trim(),
          party: party.trim(),
          con: con.trim(),
          profileURL: "http://164.100.47.194/Loksabha/Members/" + profileURL,
          profileId: parseInt(profileURL.replace('MemberBioprofile.aspx?mpsno=',''))
        })
      });
      resolve(baseList)
      //console.log($lok.html());
    })
    .catch(e => {
      reject(e)
    })
  })
}


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

function linkBaselistWithStats(baseList){
  return new Promise((resolve, reject) => {
    let newList = baseList.map(mp => {
      var ffff = stats.filter(st => {
        return mp.con.indexOf(st.Constituency) != -1
      })
      if(ffff){
        return Object.assign({}, mp, ffff[0])
      }
    })
    resolve(newList)
  })
}

function linkWithBloodMoney(baseList){
  return new Promise((resolve, reject) => {
    let recordList = []
    openProfile(bloodMoneyUrl)
    .then(res => {
      const $ = cheerio.load(res);
      const selector = ".tableFloatingHeaderOriginal"
      const $tableData = $(selector).next();
      $tableData.find('tr').each((i, tr) => {
        const profile = {
          name : $(tr).find("td:nth-child(2)").text().trim(),
          con : $(tr).find("td:nth-child(3)").text().trim().toLowerCase(),
          recordURL: $(tr).find("td:nth-child(2)").find('a:nth-child(2)').attr("href").trim(),
          crimalCase : $(tr).find('td:nth-child(5)').text().trim(),
          education : $(tr).find('td:nth-child(6)').text().trim(),
          totalAssets : $(tr).find('td:nth-child(7)').text().trim(),
          liabilities : $(tr).find('td:nth-child(8)').text().replace("~","|").trim(),
        }
        recordList.push(profile);
      })
      // Map bloodMoney with stats
      // console.log("=======>>");
      // console.log(baseList);
      // console.log(recordList);
      let finalList = baseList.map(mp => {
        var matched = recordList.filter(bm => {
          return mp.con.toLowerCase().indexOf(bm.con.toLowerCase()) != -1
        })
        if(matched){
          return Object.assign({}, mp, matched[0])
        }
      })
      resolve(finalList)
    })
    .catch(e => {
      console.error(e)
    });
  })
}

function openProfile(url){
  return fetch(url)
  .then(res => res.text())
  .catch(e => console.error(e))
}

// Magic Happends Here
createBaseListFromLokSabha()
.then(baseList => {
  linkWithGeocoords(baseList)
  .then(baseListWithGeocoords => {
    linkBaselistWithStats(baseListWithGeocoords)
    .then(baseListWithStats => {
      linkWithBloodMoney(baseListWithStats)
      .then(finalList => {
        fs.unlink("./finalList.json", delError => {
           if (delError) throw delError;
           console.log('successfully deleted finalList.json');
           fs.appendFile(`finalList.json`, JSON.stringify(finalList, null, 4), function (err) {
             if (err) console.error("failed!!");;
             console.log('Total Records : ' + finalList.length);
             console.log("Saved!");
           });
        })
      })
    })
  })
})
.catch(e => {
  console.log("Error ", e);
})
