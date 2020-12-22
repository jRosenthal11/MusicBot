import { Guild, StreamDispatcher } from "discord.js";
import ytdl from "ytdl-core";
import { Song } from "../models/Song";
import { SongQueue } from "../models/SongQueue";

module.exports = {
    name: 'play',
    description: 'Play song',
    execute(guild: Guild, song: Song, songQueue: SongQueue) {
        const serverQueue = songQueue[guild.id];
        if (!song) {
            serverQueue.voiceChannel.leave();
            delete songQueue[guild.id];
            return;
        }
        const playSong: StreamDispatcher = serverQueue.connection
            .play(ytdl(song.url))
            .on("finish", () => {
                serverQueue.songs.shift();
                this.play(guild, serverQueue.songs[0]);
            })
            .on("error", error => console.error(error));
        playSong.setVolumeLogarithmic(serverQueue.volume / 5);
        serverQueue.textChannel.send(`\n\n**Start playing**: ${song.title}`);
    }

}