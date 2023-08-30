fetch('/get-new-releases')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('new-releases-container');

        // Parcourez les données et créez des éléments pour chaque nouvelle sortie
        data.forEach(item => {
            const newItem = document.createElement('div');
            newItem.className = 'release-item';

            const artist = document.createElement('p');
            artist.textContent = `Artist: ${item.artist}`;

            const track = document.createElement('p');
            track.textContent = `Track: ${item.track}`;

            if (item.album_name) {
                const album = document.createElement('p');
                album.textContent = `Album: ${item.album_name}`;
                newItem.appendChild(album);
            }

            const releaseDate = document.createElement('p');
            releaseDate.textContent = `Release Date: ${item.release_date}`;

            const coverImage = document.createElement('img');
            coverImage.src = item.cover_url;
            coverImage.alt = 'Cover';

            newItem.appendChild(artist);
            newItem.appendChild(track);
            newItem.appendChild(releaseDate);
            newItem.appendChild(coverImage);

            container.appendChild(newItem);
        });
    })
    .catch(error => console.error(error));