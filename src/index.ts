import { Client, Message } from 'discord.js';
import { Prefix, Token } from './Config';

// login to Discord with your app's token
const client = new Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === Prefix + 'wow') {
        msg.reply('Pong!');
    }
});

client.login(Token);
