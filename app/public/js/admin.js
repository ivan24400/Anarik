function regRequestEvent(){
  //Accept a token request
  $('.token-req-list').on('click','.admin-ack-req',function(){

    let json_data = new Object();
    json_data.token_requestor_index = $(this).siblings('.token-requestor-index').text();
    console.log('Acknowledging request ...');
    $.ajax({
      method: "POST",
      url: "/admin/ack-req",
      data: json_data
    }).done(function(){
      console.log('token acknowledged successfully');
    }).fail(function(){
      console.log('token acknowledgement failed');
    });
  });

  //Reject a token request
  $('.token-req-list').on('click','.admin-reject-req',function(){
    let json_data = new Object();
    //json_data.token_requestor_addr = $(this).siblings('.token-requestor-addr').text();
    json_data.token_requestor_index = $(this).siblings('.token-requestor-index').text();
    console.log('Rejecting request ...');

    $.ajax({
      method: "POST",
      url: "/admin/reject-req",
      data: json_data
    }).done(function(){
      console.log('token rejected successfully');
    }).fail(function(err){
      console.log('token rejection failed');console.log(err);
    });
  });
}

// Send tokens to a given user
function sendTokens(){
  let json_data = new Object();
  json_data.token_count = $('#form-request-tokens #token-count').val();
  json_data.token_recvr = $('#form-request-tokens #token-recvr').val();
  console.log('Sending tokens ...');

  $.ajax({
    method: "POST",
    url: "/admin/send-tokens",
    data: json_data
  }).done(function(){
    console.log('token sent successfully');
  }).fail(function(){
    console.log('token send failed');
  }).always(function(){
    $('#form-request-tokens #token-count').val("");
  });
}

$(function(){
  regRequestEvent();
});
