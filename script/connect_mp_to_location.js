var LIST = [];
(function(){
  let failedCount = 0, successCount = 0;
  fetch("./../data/2014/mp_list.0.2.json", { method: "GET" })
  .then( res => res.json())
  .then(res => {
    let mpList = res;
    let counter = 0;
    var to = setInterval(() => {
      if(counter > mpList.length - 1){
        console.log("################################################################");
        console.log("ALL DONE");
        console.log(JSON.stringify({
          mp_list: LIST,
        }));
        clearInterval(to);
        return;
      }else{
        var mp = mpList[counter];
        console.log(counter);
        console.log("calling for ", mp.name);
        getLocationBasedOnCity(mp.con)
        .then(coords => {
          LIST.push(Object.assign({}, mp, coords))
            console.log(`Done ${((counter/mpList.length)*100).toFixed(1)}%`)
            counter++;
        })
      }
    }, 500)
  });

})(window);

function getLocationBasedOnCity(city){
  return new Promise((resolve, reject) => {
    const gmap = "https://maps.googleapis.com/maps/api/geocode/json?address="
    const key = "AIzaSyBq-jMCPwSN0LMAZZ-wwl82mKwvuEhsRL0"
    fetch(`${gmap}${city.toLowerCase()}&key=${key}`)
    .then(res1 => res1.json())
    .then(res1 => {
      if(res1 && !res1.error_message){
        var coords = res1.results[0] && res1.results[0].geometry.location
        console.log("Success ", coords);
        resolve(coords)
      }else{
        console.log("Failed ", city, res1);
        reject(res1)
      }
    })
  })
}
