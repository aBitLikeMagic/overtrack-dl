# overtrack-dl

Downloads a back-up of your game data from https://overtrack.gg.

Use your browser's developer tools to find the ID in your `session` cookie
(not visible in JavaScript), and use it as the `session` environment variable
to run the `./index.js` Node script (here using yarn).

    yarn install;
    export session=YOUR_SESSION_ID;
    yarn run start;

If you run it again, it won't re-download games it already has.
