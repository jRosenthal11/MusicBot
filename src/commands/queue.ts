import { MessageEmbed } from "discord.js";
import { Command, CommandArgs } from "../models/Command";

export = {
    name: 'queue',
    description: 'Get song queue',
    execute(commandArgs: CommandArgs) {
        if (!commandArgs.msg.member.voice) {
            return commandArgs.msg.channel.send(`You must be in a voice channel to execute this command`);
        }
        const embededMessage: MessageEmbed = new MessageEmbed();
        embededMessage.setColor('#0099ff')
            .setTitle('Queue');

        for (const song of commandArgs.serverQueue.songs) {
            embededMessage.addFields(
                {
                    name: song.messageAuthor,
                    value: song.title
                }
            )
        }
        return commandArgs.msg.channel.send(embededMessage);
    }

} as Command;