document.addEventListener("DOMContentLoaded", function (){
    let LoginBtn = document.querySelector(".footer__login__button");
    LoginBtn.addEventListener("click", function (){
        window.location = "/login";
    })
})