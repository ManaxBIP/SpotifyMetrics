document.addEventListener('DOMContentLoaded', function () {
    let login_button = document.getElementById('footer__login__button');

    login_button.addEventListener('click', async function () {
        try {
            // Call the server-side endpoint to get the Spotify authorization URL
            const response = await axios.get('/spotify/authorize');

            // Open the Spotify login page in a new window or tab
            window.open(response.data.authorization_url, '_blank');
        } catch (error) {
            console.error('The request failed with the message:', error.message);
        }
    });
});
