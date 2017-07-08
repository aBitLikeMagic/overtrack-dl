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

### Server

You can also run this minimal server, and enter the session key in your browser 
at <http://localhost:8080>. This isn't very useful unless you want to share 
some of the individial downloaded data files, which I'm doing as an example at 
<https://overtrack-dl.glitch.me>. You probably shouldn't bother. 

    yarn install;
    yarn run server;
