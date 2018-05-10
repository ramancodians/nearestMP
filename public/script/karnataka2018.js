/*
Coded By: Raman Choudhary
*/

// Step 1: Get MP Data
function getMPData(){
  return fetch("./data/final2018KA.json")
  .then(res => res.json())
  .catch(err => handleError)
}

// Step 2: Show why Permission is Needed
function whyLocationIsNeeded(){
  return new Promise((resolve, reject) => {
    $("")
  })
}

// Step 2: Get User Location
function getUserLocation(list){
  console.log(list);
  return new Promise((resolve, reject) => {
    $("body").append(`
      <h1>Hellow World</h1>
      `)
  })
}

function handleError(error){

}

function bootstrap(){
  getMPData()
  .then(getUserLocation)
  .then((list, location) => {
    console.log(list, location);
  })
  .catch(handleError)
}

bootstrap();
