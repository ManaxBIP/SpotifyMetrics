var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const axios = require('axios');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
const clientId = '5fb2c7aaa6644c7fb487926dc9ab8c19';//'71d32f8a935a45c195b995d4ee47e15b';
const clientSecret = 'c3b9ed00c1414555aea6e56caf11e6a5';//'cfb092f7f25b48b9be4cfe3c762ed05a';
const redirectUri = 'http://127.0.0.1:3000/callback';
let accessT = "";
let NewReleases = [];


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
  //const scopes = 'user-read-private user-read-email'; // Les autorisations que vous souhaitez obtenir de l'utilisateur
  const scopes = 'user-read-private user-read-email user-library-read playlist-read-private playlist-read-collaborative user-follow-read user-top-read user-read-recently-played user-read-playback-state user-modify-playback-state';

  // Rediriger l'utilisateur vers la page de connexion Spotify
  res.redirect(`https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scopes)}`);

});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'routes', 'html', 'home.html'));
});

const CACHE_DURATION = 3600 * 1000; // Cache pendant 1 heure (en millisecondes)

let cachedReleases = null;
let lastFetchTime = 0;


app.get('/get-new-releases', async (req, res) => {
  try {
    const currentTime = Date.now();

    // Vérifiez si les données sont en cache et si le cache a expiré
    if (!cachedReleases || currentTime - lastFetchTime > CACHE_DURATION) {
      const userTopArtistsResponse = await axios.get(
          'https://api.spotify.com/v1/me/top/artists',
          {
            headers: {
              Authorization: `Bearer ${accessT}`,
            },
            params: {
              limit: 50,
            },
          }
      );

      const topArtists = userTopArtistsResponse.data.items;

      const today = new Date().toISOString().slice(0, 10);
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastWeekFormatted = lastWeek.toISOString().slice(0, 10);

      const newReleasesPromises = topArtists.map(async (artist) => {
        const artistId = artist.id;
        const artistName = artist.name;

        const artistAlbumsResponse = await axios.get(
            `https://api.spotify.com/v1/artists/${artistId}/albums`,
            {
              headers: {
                Authorization: `Bearer ${accessT}`,
              },
            }
        );

        const artistAlbums = artistAlbumsResponse.data.items;

        const newReleases = [];

        for (const album of artistAlbums) {
          const releaseDate = album.release_date;
          if (releaseDate >= lastWeekFormatted && releaseDate <= today) {
            const albumId = album.id;
            const albumName = album.name;

            const albumTracksResponse = await axios.get(
                `https://api.spotify.com/v1/albums/${albumId}/tracks`,
                {
                  headers: {
                    Authorization: `Bearer ${accessT}`,
                  },
                }
            );

            const albumTracks = albumTracksResponse.data.items;

            const featuringTracks = albumTracks.filter((track) =>
                track.artists.some((artist) => artist.id === artistId)
            );

            for (const track of featuringTracks) {
              const trackName = track.name;
              const shouldDisplayAlbumName = trackName !== albumName;

              newReleases.push({
                artist: artistName,
                track: trackName,
                album_name: shouldDisplayAlbumName ? albumName : undefined,
                release_date: releaseDate,
                cover_url: album.images[0].url,
              });
            }
          }
        }

        return newReleases;
      });

      const allNewReleases = await Promise.all(newReleasesPromises);
      const flattenedReleases = allNewReleases.flat();

      // Mettez en cache les nouvelles sorties
      cachedReleases = flattenedReleases;
      lastFetchTime = currentTime;
    }

    // Renvoyez les données mises en cache
    res.json(cachedReleases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Une erreur s\'est produite.' });
  }
});


/*app.get('/listening-time-:artist', async (req, res) => {
  const accessToken = accessT;
  const artistName = req.params.artist.replace(/_/g, ' ');
  const baseHistoryUrl = `https://api.spotify.com/v1/me/player/recently-played?limit=50`; // Remplacez par l'URL de l'historique d'écoute de Spotify
  let totalListeningTime = 0;

  try {
    let nextUrl = baseHistoryUrl;

    while (nextUrl) {
      const response = await fetch(nextUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (data.items.length > 0) {
        data.items.forEach(item => {
          if (item.track.artists.some(artist => artist.name === artistName)) {
            totalListeningTime += item.track.duration_ms;
          }
        });
      }

      nextUrl = data.next;
    }

    // Convertissez la durée en jours, heures et minutes et renvoyez le résultat.
    const totalListeningTimeInSeconds = totalListeningTime / 1000;
    const days = Math.floor(totalListeningTimeInSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalListeningTimeInSeconds % (60 * 60 * 24)) / 3600);
    const minutes = Math.floor((totalListeningTimeInSeconds % 3600) / 60);

    const result = `Vous avez écouté ${artistName} pendant ${days} days, ${hours} hours, ${minutes} minutes.`;
    res.send(result);
  } catch (error) {
    console.error(error);
    const result = `Erreur lors de la récupération de l'historique d'écoute pour ${artistName}.`;
    res.send(result);
  }

  // Démarrez le processus en appelant la fonction avec l'URL de base.
  // Obtenez l'artiste en fonction de son nom.
  fetch(`https://api.spotify.com/v1/search?q=${artistName}&type=artist`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })
      .then(response => response.json())
      .then(data => {
        if (data.artists && data.artists.items.length > 0) {
          const artistId = data.artists.items[0].id; // Obtenez l'ID du premier artiste trouvé
          console.log(artistId)
          fetchFullListeningHistory(baseHistoryUrl, artistId);
        } else {
          const result = `Artiste "${artistName}" introuvable.`;
          res.send(result);
        }
      })
      .catch(error => {
        console.error(error);
        const result = `Erreur lors de la recherche de l'artiste "${artistName}".`;
        res.send(result);
      });
});*/

/*app.get('/listening-time-:artist', async (req, res) => {
  const accessToken = accessT;
  const artistName = req.params.artist.replace(/_/g, ' ');
  const baseHistoryUrl = `https://api.spotify.com/v1/me/player/recently-played?limit=50`; // Remplacez par l'URL de l'historique d'écoute de Spotify
  let totalListeningTime = 0;

  try {
    let nextUrl = baseHistoryUrl;

    while (nextUrl) {
      const response = await fetch(nextUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (data.items.length > 0) {
        data.items.forEach(item => {
          if (item.track.artists.some(artist => artist.name === artistName)) {
            totalListeningTime += item.track.duration_ms;
          }
        });
      }

      nextUrl = data.next;
    }

    // Convertissez la durée en jours, heures et minutes et renvoyez le résultat.
    const totalListeningTimeInSeconds = totalListeningTime / 1000;
    const days = Math.floor(totalListeningTimeInSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalListeningTimeInSeconds % (60 * 60 * 24)) / 3600);
    const minutes = Math.floor((totalListeningTimeInSeconds % 3600) / 60);

    const result = `Vous avez écouté ${artistName} pendant ${days} days, ${hours} hours, ${minutes} minutes.`;
    res.send(result);
  } catch (error) {
    console.error(error);
    const result = `Erreur lors de la récupération de l'historique d'écoute pour ${artistName}.`;
    res.send(result);
  }
});*/

app.get('/listening-time/:artistId', async (req, res) => {
  try {
    const artistId = req.params.artistId;
    const accessToken = accessT;

    // Nombre de résultats à récupérer par page
    const limit = 50;

    // Début de la pagination
    let offset = 0;
    let totalMinutes = 0;

    // Définir une limite de boucle pour éviter une boucle infinie
    const maxIterations = 50; // Choisissez un nombre approprié selon vos besoins

    for (let i = 0; i < maxIterations; i++) {
      const recentlyPlayedEndpoint = `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}&offset=${offset}`;

      const recentlyPlayedResponse = await axios.get(recentlyPlayedEndpoint, {
        headers: {
          'Authorization': 'Bearer ' + accessToken
        },
      });

      const artistTracks = recentlyPlayedResponse.data.items.filter(item =>
        item.track.artists.some(artist => artist.name === artistId)
      );

      const totalTime = artistTracks.reduce((total, item) => total + item.track.duration_ms, 0);
      totalMinutes += Math.round(totalTime / 60000);

      // Si le nombre d'éléments retournés est inférieur à la limite, nous avons atteint la fin de l'historique
      if (recentlyPlayedResponse.data.items.length < limit) {
        break;
      }

      // Mettre à jour l'offset pour la prochaine itération
      offset += limit;
    }

    
    res.json({ artistId, totalMinutes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération de l\'historique d\'écoute.' });
  }
});




app.get('/callback', async (req, res) => {
  const code = req.query.code;

  // Échanger le code d'autorisation pour un jeton d'accès
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token',
        `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
          }
        });

    const accessToken = response.data.access_token;
    accessT = accessToken;
    const refreshToken = response.data.refresh_token;

    // Vous pouvez maintenant utiliser l'accessToken pour faire des appels à l'API Spotify au nom de l'utilisateur connecté
    // Par exemple, récupérer les informations du profil de l'utilisateur
    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = userResponse.data;
    console.log(userData);

    const topTracksResponse = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
      params: {
        limit: 5,
        time_range: 'medium_term',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const topTracksData = topTracksResponse.data;
    const topTracksNames = topTracksData.items.map((track) => track.name);
    console.log('Top 5 Tracks:', topTracksNames);

    const topArtistsResponse = await axios.get('https://api.spotify.com/v1/me/top/artists', {
      params: {
        limit: 5,
        time_range: 'medium_term',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const topArtistsData = topArtistsResponse.data;
    const topArtistsNames = topArtistsData.items.map((artist) => artist.name);
    console.log('Top 5 Artists:', topArtistsNames);

    res.redirect("home");

  } catch (error) {
    console.error('Erreur lors de l\'échange du code d\'autorisation pour le jeton d\'accès :', error.message);
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    res.status(500).send('Une erreur est survenue lors de la connexion.');
  }
});





app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
