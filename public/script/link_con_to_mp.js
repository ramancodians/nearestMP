var LIST = [];
(function(){
  //get mpList
  fetch('./../data/2014/mp_list.0.3.json')
  .then(mpListRes => mpListRes.json())
  .then(mpListRes => {
    fetch('./../data/2014/stats.0.5.json')
    .then(res => res.json())
    .then(stats => {
      var newList = mpListRes.map(mp => {
        var ffff = stats.filter(st => {
          return mp.con.indexOf(st.Constituency) != -1 && mp.name.indexOf(st["MP name"] != -1)
        })
        if(ffff){
          return Object.assign({}, mp, ffff[0])
        }
      })
      LIST = newList;
    })
  })
})(window, $)
