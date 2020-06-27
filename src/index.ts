import { Client, Message } from 'discord.js';
import { prefix, token } from './Config';
import ytdl = require('ytdl-core');

// login to Discord with your app's token
const client = new Client();
const songQueue = new Map();

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
    }
    if (!msg.content.startsWith(prefix)) {
        return;
    }
    if (msg.content.startsWith(`${prefix}play`)) {

    }
    if (msg.content.startsWith(`${prefix}skip`)) {

    }
    if (msg.content.startsWith(`${prefix}stop`)) {
        return
    }
});

client.login(token);
