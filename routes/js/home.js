fetch('/get-new-releases')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('new-releases-container');

        // Parcourez les données et créez des éléments pour chaque nouvelle sortie
        data.forEach(item => {
            let IsAlbum = false;
            const album = document.createElement('p');
            const newItem = document.createElement('div');
            newItem.className = 'release-item';

            const CoverDiv = document.createElement('div');
            CoverDiv.className = 'CoverDiv';

            const TrackInfoDiv = document.createElement('div');
            TrackInfoDiv.className = 'TrackInfoDiv';

            const artist = document.createElement('p');
            artist.textContent = `${item.artist}`;
            artist.style.fontFamily = "'Gotham Light', sans-serif";

            const track = document.createElement('p');
            track.textContent = ` ${item.track}`;
            if( track.textContent.length > 26){
                const count = track.textContent.length - 26;
                const res = (count * 5) + 105;
                track.textContent += "‎ ‎ ‎ ‎ ‎ ‎ ‎" +  `${item.track}`;
                //track.id = "animated";

                track.classList.add("animate-track");
            }

            if (item.album_name) {
                album.textContent = ` ${item.album_name}`;
                if( album.textContent.length > 26){
                    album.id = "animated";
                }
                IsAlbum = true;
            }

            const releaseDate = document.createElement('p');
            releaseDate.textContent = `Release Date: ${item.release_date}`;

            const coverImage = document.createElement('img');
            coverImage.src = item.cover_url;
            coverImage.alt = 'Cover';
            coverImage.style.height = '7vh';
            coverImage.style.width ='7vh';
            coverImage.style.borderRadius = '10px';
            coverImage.style.boxShadow = '8px 8px 8px 0px rgba(0,0,0,0.5)';

            CoverDiv.appendChild(coverImage);
            TrackInfoDiv.appendChild(track);
            TrackInfoDiv.appendChild(album);
            TrackInfoDiv.appendChild(artist);
            newItem.appendChild(CoverDiv);
            newItem.appendChild(TrackInfoDiv);
            //newItem.appendChild(releaseDate);

            container.appendChild(newItem);
        });
    })
    .catch(error => console.error(error));