/** ANSI color helpers for terminal output */

export const reset = "\x1b[0m";
export const bold = (s: string) => `\x1b[1m${s}${reset}`;
export const dim = (s: string) => `\x1b[2m${s}${reset}`;
export const red = (s: string) => `\x1b[31m${s}${reset}`;
export const green = (s: string) => `\x1b[32m${s}${reset}`;
export const yellow = (s: string) => `\x1b[33m${s}${reset}`;
export const blue = (s: string) => `\x1b[34m${s}${reset}`;
export const cyan = (s: string) => `\x1b[36m${s}${reset}`;
