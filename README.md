# overtrack-dl

Downloads a back-up of your game data from <https://overtrack.gg>.

## Usage

You need to be logged in to `overtrack.gg` and manually copy your 
`api.overtrack.gg` session key from your browser's cookies. In Chrome, you can 
do this by navigating to
`chrome://settings/cookies/detail?site=api.overtrack.gg`, expanding the
`session` cookie listing by pressing ▼, and copying the long alphanumeric 
"content" value.

After you fetch the data (using either of the following interfaces) it will be 
saved in the `games/` folder. Games will not be re-downloaded unnecessarily.

### Command-Line

Provide the key in the `session` environment variable when running the Node 
script `./main.js`, such as by using Yarn:

    yarn install;
    export session=YOUR_SESSION_ID;
    yarn run main;

Or, instead of providing a session key and downloading your own games, you can
specify a `shareKey` to download a user's shared games.

    yarn install;
    export shareKey=THEIR_SHARE_KEY;
    yarn run main;

### Server

You can also run this minimal server, which will provide an interface for
specifying session and sharing keys in your browser at <http://localhost:8080>.
This isn't really optimized for non-local users, but you can see it running at
<https://overtrack-dl.glitch.me> if you're curious.

    yarn install;
    yarn run server;
