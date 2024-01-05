fetch('/get-user-info')
    .then(response => response.json())
    .then(data => {
        console.log(data.display_name);
        document.getElementsByClassName('titleBlue__profile')[0].innerHTML = data.display_name;
        document.getElementsByClassName('profilePicture__profile')[0].src = data.images[1].url;
        document.getElementsByClassName('subs')[0].innerHTML = data.followers.total;
    })
    .catch(error => console.error(error))

fetch('/get-user-playlists')
    .then(response => response.json())
    .then(data => {
        console.log(data.totalPublicPlaylists);
        document.getElementsByClassName('publicPlaylist')[0].innerHTML = data.totalPublicPlaylists;
    })
    .catch(error => console.error(error))

fetch('/get-top-artist')
    .then(response => response.json())
    .then(data => {
        console.log(data[0].name);
        console.log(data[0].images[1].url);
        document.getElementsByClassName('favArtistName__profile')[0].innerHTML = data[0].name;
        document.getElementsByClassName('artistImg__profile')[0].src = data[0].images[1].url;
    })
    .catch(error => console.error(error))
