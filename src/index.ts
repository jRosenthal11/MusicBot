import { Client, TextChannel, User, Collection } from 'discord.js';
import { prefix, chName } from './Config';
import ytdl = require('ytdl-core');
import { Queue } from './models/Queue';
import { SongQueue } from './models/SongQueue';
import * as env from 'dotenv';
import { readdir } from 'fs';
import { Command } from './models/Command';
import { Song } from './models/Song';

const client = new Client();
let songQueue: SongQueue = {};
let totalVotes = new Map<Song, Map<User, number>>();
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
const commands = new Collection();
readdir('dist/commands', (err, allFiles) => {
    if (err) {
        console.error(`Unable to load commands: ${err}`);
    }
    let files = allFiles.filter(f => f.split('.').pop() === ('js'));
    if (files.length <= 0) {
        console.log(`No commands found!`);
        return;
    }
    for (const file of files) {
        const command = require(`./commands/${file}`) as {
            name: string, command: Command
        };
        commands.set(command.name, command);
    }

});
client.on('message', msg => {
    const textChannel: TextChannel = msg.channel as TextChannel;
    if (textChannel.name === chName) {
        if (msg.author.bot || !msg.content.startsWith(prefix)) {
            return;
        }
        const args = msg.content.slice(prefix.length).trim().split(/ +/);
        if (args.length < 1) {
            return;
        }
        const command = args.shift()!.toLowerCase();
        if (!msg.content.startsWith(prefix) || msg.author.bot) {
            return;
        }
        const commandFile = commands.get(command) as Command;
        if (!commandFile) {
            return;
        }
        if (commands.size < 1) {
            return;
        }
        const serverQueue: Queue = songQueue[msg.guild.id];

        commandFile.execute({
            msg: msg,
            serverQueue: serverQueue,
            totalVotes: totalVotes,
            songQueue: songQueue
        });
    }

});
client.login(process.env.DISCORD_TOKEN);
