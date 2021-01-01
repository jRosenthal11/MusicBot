import { Command, CommandArgs } from "../models/Command";

export ={
    name: 'stop',
    description: 'Stop current song',
    execute(commandArgs: CommandArgs) {
        if (!commandArgs.msg.member.voice.channel)
            return commandArgs.msg.channel.send("You have to be in a voice channel to stop the music!");
        commandArgs.serverQueue.songs = [];
        commandArgs.serverQueue.connection.dispatcher.end();
    }

} as Command;