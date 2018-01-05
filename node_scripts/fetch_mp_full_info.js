const fetch = require('node-fetch');
//const $ = require('jquery');
const cheerio = require('cheerio');
const fs = require('fs');
const mplist = require('./../data/2014/mp_list.0.1.json');

mplist.map(mp => {
  openProfile(mp.profileURL)
  .then(res => {
    const $ = cheerio.load(res);
    $('#pnlDiv1').find(".seacrh_wrap").remove();
    const mpProfile = $('#pnlDiv1').html();
    const imgURL = $('#pnlDiv1').find('img#ContentPlaceHolder1_Image1').attr('src');
    const index = imgURL.lastIndexOf("/") + 1;
    const filename = imgURL.substr(index);
    const mpId = filename.replace(/\.[^/.]+$/, "");
    fs.appendFile(`html/${mpId}.html`, mpProfile, function (err) {
      if (err) console.error("failed!!");;
      console.log('Saved!');
    });
    console.log(filename, mpId);
  })
  .catch(e => {
    console.error(e)
  });
})



function openProfile(url){
  return fetch(url)
  .then(res => res.text())
  .catch(e => console.error(e))
}
