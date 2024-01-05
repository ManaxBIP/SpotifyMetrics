fetch('/get-new-releases')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('new-releases-container');

        // Triez les données en fonction de la date de sortie (du plus récent au plus ancien)
        data.sort((a, b) => {
            const dateA = new Date(a.release_date);
            const dateB = new Date(b.release_date);
            return dateB - dateA;
        });

        // Créez un objet pour stocker les dates déjà affichées
        const displayedDates = {};

        // Parcourez les données triées
        data.forEach(item => {
            const releaseDate = document.createElement('p');
            const currentDate = new Date();
            const releaseDateFormatted = new Date(item.release_date);

            // Formatez la date de sortie au format "dd/mm"
            const formattedDate = releaseDateFormatted.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
            });

            // Vérifiez si la date de sortie a déjà été affichée
            if (!displayedDates[formattedDate]) {
                // Affichez la date de sortie
                const differenceInMilliseconds = currentDate - releaseDateFormatted;
                const differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));

                if (differenceInDays === 0) {
                    releaseDate.textContent = formattedDate + ", today";
                } else {
                    releaseDate.textContent = formattedDate + ", " + differenceInDays + "d ago";
                }
                releaseDate.className = 'ReleaseDate';
                container.appendChild(releaseDate);

                // Marquez la date de sortie comme déjà affichée
                displayedDates[formattedDate] = true;
            }
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

            if( track.textContent.length > 26) {
                let t = 0;
                setInterval(() => {
                    let res = -0//-((count * 5) + (count * 13));
                    requestAnimationFrame(() => {
                        // Obtenez la largeur de l'élément track en pixels
                        const trackWidth = track.offsetWidth; // ou track.clientWidth
                        const trackWidthInt = parseInt(trackWidth, 10);

                        if (t=== 0){
                            t = trackWidthInt
                        }

                        /*if (t!=0){
                            console.log('Largeur de track en int :', t);
                        } else{
                            console.log('Largeur de track en int :', trackWidthInt);
                        }*/

                        if (t!=0){
                            res = -((t / 2) + 14)
                        } else{
                            res = -((trackWidthInt / 2) + 14)
                        }
                    });
                    track.textContent += "‎ ‎ ‎ ‎ ‎ ‎ ‎" + `${item.track}`;

                    track.classList.add('track-animation');

                    track.style.transform = 'translateX(0)';

                    requestAnimationFrame(() => {

                        track.style.transform = `translateX(${res}px)`;

                        track.addEventListener('animationend', () => {
                            track.classList.remove('track-animation');
                        }, {once: true});
                    });
                }, 2000);

            }



            if (item.album_name) {
                album.textContent = ` ${item.album_name}`;
                if( album.textContent.length > 26){
                    album.id = "animated";
                }
                IsAlbum = true;
            }

            releaseDate.className = "ReleaseDate"

            const coverImage = document.createElement('img');
            coverImage.src = item.cover_url;
            coverImage.alt = 'Cover';
            coverImage.style.height = '7vh';
            coverImage.style.width ='7vh';
            coverImage.style.borderRadius = '10px';
            coverImage.style.boxShadow = '8px 8px 8px 0px rgba(0,0,0,0.5)';

            container.appendChild(releaseDate);
            CoverDiv.appendChild(coverImage);
            TrackInfoDiv.appendChild(track);
            TrackInfoDiv.appendChild(album);
            TrackInfoDiv.appendChild(artist);
            newItem.appendChild(CoverDiv);
            newItem.appendChild(TrackInfoDiv);


            container.appendChild(newItem);
        });
    })
    .catch(error => console.error(error));