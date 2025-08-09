import { LevelInfo } from "../../util/LevelManager";

export const LEVELS: LevelInfo[] = [
    {
        level: "1",
        nextLevel: "2",
        name: "bootup",
        difficulty: 0.3,
        width: 80,
        height: 60,
        cutscene: 0,
        colors: {
            wallColor: 0x4A4E69,
            bgColor: 0x5A5E79
        }
    },
    {
        level: "2",
        nextLevel: "3",
        name: "deeper",
        difficulty: 0.5,
        width: 100,
        height: 60,
        colors: {
            wallColor: 0x8C1C13,
            bgColor: 0xBF4342
        }
    },
    {
        level: "3",
        nextLevel: "1",
        name: "signal",
        difficulty: 0.8,
        width: 140,
        height: 80,
        cutscene: 1,
        colors: {
            wallColor: 0x240046,
            bgColor: 0x3c096c
        }
    }
];