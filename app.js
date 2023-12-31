var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const axios = require('axios');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const clientId = '71d32f8a935a45c195b995d4ee47e15b';
const clientSecret = 'cfb092f7f25b48b9be4cfe3c762ed05a';
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
  res.sendFile(path.join(__dirname, 'routes', 'html', 'home2.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'routes', 'html', 'profile.html'));
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
