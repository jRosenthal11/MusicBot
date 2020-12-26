import { Command, CommandArgs } from "../models/Command";

export = {
    name: 'skip',
    description: 'skip song',
    execute(commandArgs: CommandArgs) {
        const msg = commandArgs.msg;
        const serverQueue = commandArgs.serverQueue;
        const skipMsg = commandArgs.skipMsg;
        let totalVotes = commandArgs.totalVotes;
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
                    commandArgs.totalVotes = 0;
                    commandArgs.skipMsg = [];
                    msg.channel.send(`Song skipped`);
                    return;
                }
            }
            msg.channel.send(`To skip this song you need 3 votes. **Total votes**: \`${totalVotes}/3\``);
        }
    }

} as Command;