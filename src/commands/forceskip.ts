import { Command, CommandArgs } from "../models/Command";

export = {
    name: 'forceskip',
    description: 'Force Skip Song',
    execute(commandArgs: CommandArgs) {
        if (!commandArgs.msg.member.voice.channel) {
            return commandArgs.msg.channel.send('You must be in a voice channel to skip a song');
        }
        commandArgs.serverQueue.connection.dispatcher.end();
    }

} as Command;