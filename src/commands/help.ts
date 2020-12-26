import { MessageEmbed } from "discord.js";
import { commandURL } from "../Config";
import { Command, CommandArgs } from "../models/Command";

export = {
    name: 'help',
    description: 'help commands',
    execute(commandArgs: CommandArgs) {
        const embededMessage: MessageEmbed = new MessageEmbed();
        embededMessage.setColor('#0099ff')
            .setTitle('Click here')
            .setURL(`${commandURL}`)
            .setDescription('To see the list of commands');
        commandArgs.msg.channel.send(embededMessage);
    }
} as Command;