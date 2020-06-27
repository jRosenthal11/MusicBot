import { Song } from './Song';
import { Queue } from './Queue';

export interface SongQueue {
    [id: string]: Queue;
}