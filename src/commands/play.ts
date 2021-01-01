import { StreamDispatcher, TextChannel, VoiceChannel } from "discord.js";
import ytdl from "ytdl-core";
import { Command, CommandArgs } from "../models/Command";
import { Queue } from "../models/Queue";
import { Song } from "../models/Song";

export ={
    description: "Execute commands",
    name: "play",
    async execute(commandArgs: CommandArgs) {
        const songURL = commandArgs.msg.content.split(" ");
        const textChannel: TextChannel = commandArgs.msg.channel as TextChannel;
        const voiceChannel: VoiceChannel = commandArgs.msg.member.voice.channel;
        if (!voiceChannel) {
            return commandArgs.msg.channel.send('You need to be in a voice channel to play music!');
        }
        const permissions = voiceChannel.permissionsFor(commandArgs.msg.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            return commandArgs.msg.channel.send("I need permissions to join the channel");
        }
        if (!songURL[1]) {
            return commandArgs.msg.channel.send('You did not provide a url for the song. !play <songURL>');
        }
        const songInfo = await ytdl.getInfo(songURL[1]);

        const song: Song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
            messageAuthor: commandArgs.msg.author.username
        };

        if (!commandArgs.serverQueue) {
            const queueObj: Queue = {
                textChannel: textChannel,
                voiceChannel: voiceChannel,
                playing: true,
                songs: [],
                connection: null,
                volume: 5
            };
            commandArgs.songQueue[commandArgs.msg.guild.id] = queueObj;
            queueObj.songs.push(song);
            try {
                let connection = await voiceChannel.join();
                queueObj.connection = connection;
                commandArgs.msg.channel.send(
                    `:thumbsup: **Joined** \`${voiceChannel.name}\` \n:page_facing_up: **Bound to** \`${textChannel.name}\` \n:loud_sound: **Searching** :mag_right: \`${song.url}\` \n**Playing** :notes: \`${song.title}\` `
                );
                const play = function pl(s: Song) {
                    const serverQueue = commandArgs.songQueue[commandArgs.msg.guild.id];
                    if (!s) {
                        serverQueue.voiceChannel.leave();
                        delete commandArgs.songQueue[commandArgs.msg.guild.id];
                        return;
                    }
                    const playSong: StreamDispatcher = serverQueue.connection
                        .play(ytdl(s.url))
                        .on("finish", () => {
                            serverQueue.songs.shift();
                            play(serverQueue.songs[0]);
                        })
                        .on("error", error => console.error(error));
                    playSong.setVolumeLogarithmic(serverQueue.volume / 5);
                    serverQueue.textChannel.send(`\n\n**Start playing**: ${s.title}`);
                }
                play(song);
            } catch (error) {
                console.log(error);
                delete commandArgs.songQueue[commandArgs.msg.guild.id];
                return commandArgs.msg.channel.send(error);
            }
        } else {
            let inQueue: boolean;
            let user: string;
            for (const s of commandArgs.serverQueue.songs) {
                if (s.title === song.title && s.url === song.url) {
                    inQueue = true;
                    user = s.messageAuthor;
                } else {
                    inQueue = false;
                }
            }
            if (!inQueue) {
                commandArgs.serverQueue.songs.push(song);
                return commandArgs.msg.channel.send(`**${song.title}** has been added to the queue!`);
            } else {
                return commandArgs.msg.channel.send(`**${user}** already added \`${song.title}\` to the queue. Please add a different song`);
            }
        }
    }

} as Command;