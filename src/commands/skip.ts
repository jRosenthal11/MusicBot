import { Command, CommandArgs } from "../models/Command";

export = {
    name: 'skip',
    description: 'skip song',
    execute(commandArgs: CommandArgs) {
        const msg = commandArgs.msg;
        const serverQueue = commandArgs.serverQueue;
        if (!msg.member.voice.channel) {
            return msg.channel.send('You must be in a voice channel to skip a song!');
        }
        if (serverQueue.songs.length === 1) {
            return msg.channel.send('There is no song in the queue to skip!');
        } else {
            if (commandArgs.totalVotes.get(commandArgs.serverQueue.songs[0])?.get(msg.author)) {
                return msg.channel.send(`You can not vote twice \`${msg.author.username}\``);
            } else {
                console.log(commandArgs.totalVotes.size);
                commandArgs.totalVotes.set(commandArgs.serverQueue.songs[0], new Map().set(msg.author, 1));
                if (commandArgs.totalVotes.size === 3) {
                    serverQueue.connection.dispatcher.end();
                    delete commandArgs.totalVotes;
                    msg.channel.send(`Song skipped`);
                    return;
                }
            }
            msg.channel.send(`To skip this song you need 3 votes. **Total votes**: \`${commandArgs.totalVotes.size}/3\``);
        }
    }

} as Command;