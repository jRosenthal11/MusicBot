import { Client } from 'discord.js';
import { prefix, token } from './config';

// login to Discord with your app's token
const client = new Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === prefix.commandPrefix + 'wow') {
        msg.reply('Pong!');
    }
});

client.login(token.token);
