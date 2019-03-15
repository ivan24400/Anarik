// Register event listener for buy item.
function regBuyItem(){
  $(".market-buy-item").click(function(){

    let json_data = new Object();
    json_data.index = $(this).parent().siblings('.market-item-id').text();
    console.log("Transacting ...");
    $.ajax({
      method:"POST",
      url:"/market/buy-item",
      data: json_data
    }).done(function(res){
      console.log("MARKET: request is succcessfull");
      console.log(res);
      window.location.reload();
    }).fail(function(err){
      console.log("MARKET: request failed");
      console.log(err);
    });
  });
}

$(function(){
  regBuyItem();
});
