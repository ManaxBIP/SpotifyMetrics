document.addEventListener('DOMContentLoaded', () => {

    const filledBar = document.querySelector('.filledBar__home');
    const Tracks = document.querySelector('.Tracks');
    const Artists = document.querySelector('.Artists');

    Tracks.addEventListener('click', () => {
        filledBar.style.transform = "translateX(0%)";
        Tracks.classList.add('selected');
        Tracks.style.animation = "colorFade 1s ease-in-out fowards"
        Artists.classList.remove('selected');
    });

    Artists.addEventListener('click', () => {
        filledBar.style.transform = "translateX(113%)";
        Tracks.classList.remove('selected');
        Artists.classList.add('selected');
    });


    const oneMonth = document.querySelector('.oneMonth');
    const sixMonth = document.querySelector('.sixMonths');
    const lifetime = document.querySelector('.lifetime');
    const background = document.querySelector('.divBackground__home');

    oneMonth.addEventListener('click', () => {
        oneMonth.classList.add('active');
        sixMonth.classList.remove('active');
        lifetime.classList.remove('active');
        background.style.transform = "translateX(0%)";
        console.log("zob dans le cul")
    });

    sixMonth.addEventListener('click', () => {
        oneMonth.classList.remove('active');
        sixMonth.classList.add('active');
        lifetime.classList.remove('active');
        background.style.transform = "translateX(100%)";
    });

    lifetime.addEventListener('click', () => {
        oneMonth.classList.remove('active');
        sixMonth.classList.remove('active');
        lifetime.classList.add('active');
        background.style.transform = "translateX(200%)";
    });
});
