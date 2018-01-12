const fetch = require('node-fetch');
//const $ = require('jquery');
const cheerio = require('cheerio');
const fs = require('fs');
const dataUrl = "http://myneta.info/ls2014/index.php?action=show_winners&sort=default"

openProfile(dataUrl)
.then(res => {
  const $ = cheerio.load(res);
  const selector = ".tableFloatingHeaderOriginal"
  const $tableData = $(selector).next();
  const LIST = []
  $tableData.find('tr').each((i, tr) => {
    const profile = {
      name : $(tr).find("td:nth-child(2)").text().trim(),
      con : $(tr).find("td:nth-child(3)").text().trim().toLowerCase(),
      recordURL: $(tr).find("td:nth-child(2)").find('a:nth-child(2)').attr("href").trim(),
      crimalCase : $(tr).find('td:nth-child(5)').text().trim(),
      education : $(tr).find('td:nth-child(6)').text().trim(),
      totalAssets : $(tr).find('td:nth-child(7)').text().trim(),
      liabilities : $(tr).find('td:nth-child(8)').text().trim(),
    }
    LIST.push(profile);
  })
  fs.appendFile(`bloodMoney.json`, JSON.stringify(LIST, null, 4), function (err) {
    if (err) console.error("failed!!");;
    console.log('Saved!');
  });
})
.catch(e => {
  console.error(e)
});

function openProfile(url){
  return fetch(url)
  .then(res => res.text())
  .catch(e => console.error(e))
}
