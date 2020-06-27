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
    } else if (!msg.content.startsWith(prefix)) {
        return;
    } else if (msg.content.startsWith(`${prefix}play`)) {

    } else if (msg.content.startsWith(`${prefix}skip`)) {

    } else if (msg.content.startsWith(`${prefix}stop`)) {
        return;
    } else if (msg.content.startsWith(`${prefix}help`)) {
        msg.channel.send('')
    } else {
        msg.channel.send("You need to enter a valid command");
    }
});

client.login(token);
