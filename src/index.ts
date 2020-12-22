import { Client, Message, VoiceChannel, Guild, TextChannel, StreamDispatcher, MessageEmbed, User } from 'discord.js';
import { prefix, token, commandURL, chName } from './Config';
import ytdl = require('ytdl-core');
import { Song } from './models/Song';
import { Queue } from './models/Queue';
import { SongQueue } from './models/SongQueue';
import * as env from 'dotenv';

// login to Discord with your app's token
const client = new Client();
let songQueue: SongQueue = {};
let totalVotes = 0;
let skipMsg: User[] = [];
env.config();

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
    const textChannel: TextChannel = msg.channel as TextChannel;
    if (textChannel.name === chName) {
        if (msg.author.bot || !msg.content.startsWith(prefix)) {
            return;
        }
        const serverQueue: Queue = songQueue[msg.guild.id];
        if (msg.content.startsWith(`${prefix}play`)) {
            executeCommand(msg, serverQueue);
            return;
        } else if (msg.content.startsWith(`${prefix}skip`)) {
            skip(msg, serverQueue);
            return;
        } else if (msg.content.startsWith(`${prefix}stop`)) {
            stop(msg, serverQueue);
            return;
        } else if (msg.content.startsWith(`${prefix}fs`)) {
            forceSkip(msg, serverQueue);
            return;
        } else if (msg.content.startsWith(`${prefix}help`)) {
            const embededMessage: MessageEmbed = new MessageEmbed();
            embededMessage.setColor('#0099ff')
                .setTitle('Click here')
                .setURL(`${commandURL}`)
                .setDescription('To see the list of commands');
            msg.channel.send(embededMessage);
            return;
        } else if (msg.content.startsWith(`${prefix}q`)) {
            queue(msg, serverQueue);
            return;
        }
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
    if (!songURL[1]) {
        return msg.channel.send('You did not provide a url for the song. !play <songURL>');
    }
    const songInfo = await ytdl.getInfo(songURL[1]);

    const song: Song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
        messageAuthor: msg.author.username
    };

    if (!serverQueue) {
        const queueObj: Queue = {
            textChannel: textChannel,
            voiceChannel: voiceChannel,
            playing: true,
            songs: [],
            connection: null,
            volume: 5
        };
        songQueue[msg.guild.id] = queueObj;
        queueObj.songs.push(song);
        try {
            let connection = await voiceChannel.join();
            queueObj.connection = connection;
            msg.channel.send(
                `:thumbsup: **Joined** \`${voiceChannel.name}\` \n:page_facing_up: **Bound to** \`${textChannel.name}\` \n:loud_sound: **Searching** :mag_right: \`${song.url}\` \n**Playing** :notes: \`${song.title}\` `
            );
            play(msg.guild, queueObj.songs[0]);
        } catch (error) {
            console.log(error);
            delete songQueue[msg.guild.id];
            return msg.channel.send(error);
        }
    } else {
        let inQueue: boolean;
        let user: string;
        for (const s of serverQueue.songs) {
            if (s.title === song.title && s.url === song.url) {
                inQueue = true;
                user = s.messageAuthor;
            } else {
                inQueue = false;
            }
        }
        if (!inQueue) {
            serverQueue.songs.push(song);
            return msg.channel.send(`**${song.title}** has been added to the queue!`);
        } else {
            return msg.channel.send(`**${user}** already added \`${song.title}\` to the queue. Please add a different song`);
        }
    }

}

async function queue(msg: Message, serverQueue: Queue) {
    if (!msg.member.voice) {
        return msg.channel.send(`You must be in a voice channel to execute this command`);
    }
    const embededMessage: MessageEmbed = new MessageEmbed();
    embededMessage.setColor('#0099ff')
        .setTitle('Queue');

    for (const song of serverQueue.songs) {
        embededMessage.addFields(
            {
                name: song.messageAuthor,
                value: song.title
            }
        )
    }
    return msg.channel.send(embededMessage);


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
        if (skipMsg.includes(msg.author)) {
            return msg.channel.send(`You can not vote twice \`${msg.author.username}\``);
        } else {
            skipMsg.push(msg.author);
            totalVotes++;
            if (totalVotes === 3) {
                serverQueue.connection.dispatcher.end();
                totalVotes = 0;
                skipMsg = [];
                msg.channel.send(`Song skipped`);
                return;
            }
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
