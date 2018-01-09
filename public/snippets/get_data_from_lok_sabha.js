var list = []
var $el = $('.member_list_table tbody tr');

$el.each((i, el) => {
	var photoURL = $(el).find('td:nth-child(2)').find('img').attr('src');
  var name = $(el).find('td:nth-child(2)').text();
	var party = $(el).find('td:nth-child(3)').text();
  var con = $(el).find('td:nth-child(4)').text();
  list.push({
    	name: name.trim(),
    	photoURL : photoURL.trim(),
    	party: party.trim(),
    	con: party.trim(),
    })
});
console.log(list)
