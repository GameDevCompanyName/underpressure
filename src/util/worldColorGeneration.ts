import { getRandomElement } from "./common";

const ALL_WORLD_COLORS: WorldColors[] = [
    { wallColor: 0x4A4E69, bgColor: 0x5A5E79 },
    { wallColor: 0x8C1C13, bgColor: 0xBF4342 },
    { wallColor: 0x0B2545, bgColor: 0x13315C },
    { wallColor: 0x774936, bgColor: 0x8a5a44 },
    { wallColor: 0x450920, bgColor: 0xa53860 },
    { wallColor: 0x081c15, bgColor: 0x1b4332 },
    { wallColor: 0x240046, bgColor: 0x3c096c }
];

export interface WorldColors {
    wallColor: number,
    bgColor: number
}

export function getRandomWorldColors(): WorldColors {
    return getRandomElement(ALL_WORLD_COLORS);
}