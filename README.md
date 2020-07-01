## Music Bot

This bot is open source so you can download the code and setup your own bot on your server.


After downloading the git repository you will need to install:
 
 1. Node Js
 1. npm
 1. ffmpeg

 After you have those installed navigate to the root directory of the project and type `npm install`.


 After the dependencies installed you will need to create a json file named `config.json` in the `src` directory of the project.

The file should look like this


`config.json`
 ```
 {
    "apiToken": "",
    "commandPrefix": "!",
    "helpURL": "",
    "fsPermissions": ""
}
 ```

 Once all the depndencies are installed type `tsc`. This will transpile the Typescript project down to Javascript to allow the project to run. Once that completes you are ready to launch the bot.

 Type `npm run start` and your bot will start up and start listening to commands!





 # Commands

All commands will start with the prefix `!` unless you specify a different identifier in your `config.json`.

 1. `!play <url>`: Play will add a song to the queue and begin playing the song in the voice channel you are in.

 1. `!skip`: With 3 votes you are able to skip the current song that is playing. However, if there is only 1 song in the queue you will not be able to skip it.

 1. `!fs`: Force skip will bypass the voting system to skip a song. (Only a user with specific privileges specified in the config.json will be able to force skip). Force skipping will also skip a song even if it is the last one in the queue and disconnect the bot from the channel.

 1. `!stop`: Stop will disconnect the bot from the current voice channel and clear the song queue.

 1. `!q`: Will list the songs in the current queue. (Who added the song, and the song title)