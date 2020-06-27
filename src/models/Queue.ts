import { VoiceChannel, VoiceConnection, TextChannel } from 'discord.js';
import { Song } from './Song';

export interface Queue {
    textChannel: TextChannel;
    voiceChannel: VoiceChannel;
    connection: VoiceConnection;
    songs: Song[];
    volume: number;
    playing: boolean;
}