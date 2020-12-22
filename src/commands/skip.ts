import { Message, User } from "discord.js";
import { Queue } from "../models/Queue";

module.exports = {
    name: 'skip',
    description: 'Play song',
    execute(msg: Message, serverQueue: Queue, skipMsg: User[], totalVotes: number) {
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

}