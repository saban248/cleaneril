


function doLogin(){
    username = document.getElementById('username');
    password = document.getElementById("password");
    if (!username.value || !password.value){
        openPopup();
    }
}