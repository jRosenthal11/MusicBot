import { Client, Message, VoiceChannel, Guild, TextChannel, StreamDispatcher } from 'discord.js';
import { prefix, token, commandURL } from './Config';
import ytdl = require('ytdl-core');
import { Song } from './models/Song';
import { Queue } from './models/Queue';
import { SongQueue } from './models/SongQueue';

// login to Discord with your app's token
const client = new Client();
const songQueue: SongQueue = {};
let totalVotes = 0;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.once("shardReconnecting", id => {
    console.log(`Shard with ID ${id} reconnected`);
});
client.once("shardDisconnect", (event, shardID) => {
    console.log(`Disconnected from event ${event} with ID ${shardID}`);
});


client.on('message', msg => {
    if (msg.author.bot) {
        return;
    } else if (!msg.content.startsWith(prefix)) {
        return;
    }
    const serverQueue: Queue = songQueue[msg.guild.id];
    if (msg.content.startsWith(`${prefix}test`)) {
        executeCommand(msg, serverQueue);
        return;
    } else if (msg.content.startsWith(`${prefix}>`)) {
        skip(msg, serverQueue);
        return;
    } else if (msg.content.startsWith(`${prefix}:`)) {
        stop(msg, serverQueue);
        return;
    } else if (msg.content.startsWith(`${prefix}f:`)) {
        forceSkip(msg, serverQueue);
        return;
    } else if (msg.content.startsWith(`${prefix}help`)) {
        msg.channel.send(`:page_facing_up: Click [here](${commandURL}) for the list of commands`);
        return;
    } else {
        msg.channel.send('You need to enter a valid command!');
    }
});


async function executeCommand(msg: Message, serverQueue: Queue) {
    const songURL = msg.content.split(" ");
    const textChannel: TextChannel = msg.channel as TextChannel;
    const voiceChannel: VoiceChannel = msg.member.voice.channel;
    if (!voiceChannel) {
        return msg.channel.send('You need to be in a voice channel to play music!');
    }
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return msg.channel.send("I need permissions to join the channel");
    }
    const songInfo = await ytdl.getInfo(songURL[1]);

    const song: Song = {
        title: songInfo.title,
        url: songInfo.video_url
    };

    if (!serverQueue) {
        const queue: Queue = {
            textChannel: textChannel,
            voiceChannel: voiceChannel,
            playing: true,
            songs: [],
            connection: null,
            volume: 5
        };
        songQueue[msg.guild.id] = queue;
        queue.songs.push(song);
        try {
            let connection = await voiceChannel.join();
            queue.connection = connection;
            msg.channel.send(
                `:thumbsup: **Joined** \`${voiceChannel.name}\` \n:page_facing_up: **Bound to** \`${textChannel.name}\` \n:loud_sound: **Searching** :mag_right: \`${song.url}\` \n**Playing** :notes: \`${song.title}\` `
            );
            play(msg.guild, queue.songs[0]);
        } catch (error) {
            console.log(error);
            delete songQueue[msg.guild.id];
            return msg.channel.send(error);
        }
    } else {
        serverQueue.songs.push(song);
        return msg.channel.send(`**${song.title}** has been added to the queue!`);
    }

}

async function play(guild: Guild, song: Song) {
    const serverQueue = songQueue[guild.id];
    if (!song) {
        serverQueue.voiceChannel.leave();
        delete songQueue[guild.id];
        return;
    }

    const playSong: StreamDispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error));
    playSong.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`\n\n**Start playing**: ${song.title}`);
}
async function forceSkip(msg: Message, serverQueue: Queue) {
    if (!msg.member.voice.channel) {
        return msg.channel.send('You must be in a voice channel to skip a song');
    }
    serverQueue.connection.dispatcher.end();
}

async function skip(msg: Message, serverQueue: Queue) {

    if (!msg.member.voice.channel) {
        return msg.channel.send('You must be in a voice channel to skip a song!');
    }
    if (serverQueue.songs.length === 1) {
        return msg.channel.send('There is no song in the queue to skip!');
    } else {
        totalVotes++;
        if (totalVotes === 3) {
            serverQueue.connection.dispatcher.end();
            totalVotes = 0;
            msg.channel.send(`Song skipped`);
            return;
        }
        msg.channel.send(`To skip this song you need 3 votes. **Total votes**: \`${totalVotes}/3\``);
    }


}
function stop(msg: Message, serverQueue: Queue) {
    if (!msg.member.voice.channel)
        return msg.channel.send("You have to be in a voice channel to stop the music!");
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}
client.login(token);
