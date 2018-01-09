(function(){
  fetch('./data/2014/mp_list.0.1.json')
  .then(mplist => mplist.json())
  .then(mplist => {

    openProfile(mplist[0].profileURL)
    .then(res => {
      const html = $(res).find("#pnlDiv1");
      $('body').append(html)
      console.log(html);
    });
  })
})(window,$)


function openProfile(url){
  return fetch(url)
  .then(res => res.text())
  .catch(e => console.error(e))
}
