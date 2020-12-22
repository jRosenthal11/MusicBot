import { commandPrefix } from './config.json';
import { helpURL } from './config.json';
import { channelName } from './config.json';

export const prefix: string = commandPrefix;
export const token: string = process.env.DISCORD_TOKEN;
export const commandURL: string = helpURL;
export const chName: string = channelName;