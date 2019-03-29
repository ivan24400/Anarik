/** Load list of items in user's store
  */
function loadStoreItems(){

  $.getJSON("/store",function(data){
    console.log(data);
    if(data){
      if(data.success == true){
        let store_items = data.data;

        for(let index=0; index < store_items.length; index++){
          $('#store-items-list').append('<li class="store-list-item list-group-item">' +
              '<input type="text" name="name" value="'+ store_items[index].name +'" placeholder="Name">'+
              '<input type="text" name="description" value="'+ store_items[index].description +'" placeholder="Name">'+
              '<input type="text" name="price" value="'+ store_items[index].price +'" placeholder="Price"></div>'+
              '<label data-index="'+ store_items[index].index +'"><input type="checkbox" class="store-sell-item" name="sell" value="sell"'+ (store_items[index].sale == true ? "checked" : "")+'>Sell</label>'+
              '<button class="m-3 store-update-item" type="button">Update</button>'+
              '<button class="m-3 store-delete-item" type="button">Delete</button>' +
            '</li>');
        }


        //Delete item
        $(".store-delete-item").click(function(){
          let json_data = new Object();
          json_data.product_index = $(this).siblings('label').data('index');

          $.ajax({
            method: 'DELETE',
            url:'/store/item',
            data:json_data
          }).done(function(data){
            if(data.success){
              console.log("STORE: Deleted item successfully");
            }else{
              console.log("STORE: Delete item failed"); console.log(data);
            }
          }).fail(function(){
            console.log("STORE: Delete item failed");
          }).always(function(){
            loadStoreItems();
          });

        });

        // Update an item in the store
        $(".store-update-item").on("click",function(){

          let json_data = new Object();
          json_data.product_name = $(this).siblings("input[name='name']").val();
          json_data.product_desc = $(this).siblings("input[name='description']").val();
          json_data.product_price = $(this).siblings("input[name='price']").val();
          json_data.product_sale = $(this).siblings('label').children('input').is(":checked");
          json_data.product_index = $(this).siblings('label').data('index');

          $.ajax({
            method: "PUT",
            url:"/store/item",
            data: json_data
          }).done(function(data){
            if(data.success){
              console.log("STORE: Updated item successfully");
            }else{
              console.log("STORE: Update item failed"); console.log(data);
            }
          }).fail(function(){
            console.log("STORE: Update item failed");
          }).always(function(){
            loadStoreItems();
          });

        });
      } else {
        console.log("STORE: Item(s) retrieval failed:"+data.message);
      }
    }else{
      console.log("STORE: Invalid data");
    }
  }).fail(function(){
    console.log("STORE: Operation failed");
  });
}

// Add an item in the store
// Called by the form
function storeAddItem(){
    var json_body = {
      "product_name": $('#form-store-add-item input[id="product_name"]').val(),
      "product_desc" : $('#form-store-add-item input[id="product_desc"]').val(),
      "product_price" : $('#form-store-add-item input[id="product_price"]').val()
    }
    $.ajax({
      method: "POST",
      url: "/store/item",
      data: json_body
    }).done(function(data){
      if(data.success){
        console.log("STORE: Added item successfully");
      }else{
        console.log("STORE: Added item failed");console.log(data);
      }
    }).fail(function(data){
      console.log("STORE: Add item failed");console.log(data);
    });
}

/**
  * Get purchase history
  */
function loadPurchaseHistory(){
  $.getJSON("/user/purchase-history",function(data){
    console.log(data);
    if(data){
      if(data.success == true){
        let purch_hist = data.data;
        console.log(purch_hist);

        for(let index = 0; index < purch_hist.length; index++){
          $('#purchase-history-table-body').append(
            '<tr>'+
            '<td>'+(purch_hist[index][0] === "P" ? "Bought" : (purch_hist[index][0] === "S" ? "Sold" : "Trade")) + '</td>' +
            '<td>' + purch_hist[index][1] + '</td>' +
            '<td>' + purch_hist[index][2] + '</td>' +
            '<td>' + purch_hist[index][3] + '</td>' +
            '<td>' + purch_hist[index][4] + '</td>' +
            '</tr>'
          );
        }
      }else{
        console.log("PURCHASE HISTORY: Operation failed. "+data.message);
      }
    }else{
      console.log("PURCHASE HISTORY: No data");
    }
  }).fail(function(){
    console.log("PURCHASE HISTORY: Operation failed");
  });
}

// Request some tokens from admin.
// Called by the form
function requestTokens(){
  var json_body = {
    "token_count": $('#form-request-tokens input[id="token_count"]').val()
  }
  console.log("Requesting ...");
  $.ajax({
    method: "POST",
    url: "/user/req-tokens",
    data: json_body
  }).done(function(data){
    if(data.success){
      console.log("USER: Token requested successfully");
    }else {
      console.log("USER: Token request failed"); console.log(data);
    }
  }).fail(function(data){
    console.log("USER: Token request failed"); console.log(data);
  });
}

$(function(){
  loadStoreItems();
  setTimeout(loadPurchaseHistory,180);
});
