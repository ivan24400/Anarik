// Function to compare password fields on signup
function validateCreds(event) {
  var pass = document.getElementById('s_password').value;
  let cpass = document.getElementById('s_cpassword').value;
  console.log(pass + " " + cpass);
  if(pass !== cpass){
    event.preventDefault();
    console.log("passwords do not match");
    return false;
  }
  return true;
}
