import { LevelInfo } from "../../util/LevelManager";

export const LEVELS: LevelInfo[] = [
    {
        level: "1.1",
        nextLevel: "1.2",
        name: "bootup",
        difficulty: 0.3,
        width: 90,
        height: 70,
        cutscene: 0,
        colors: {
            wallColor: 0x4A4E69,
            bgColor: 0x5A5E79
        }
    },
    {
        level: "1.2",
        nextLevel: "1.3",
        name: "bootup",
        difficulty: 0.3,
        width: 150,
        height: 100,
        colors: {
            wallColor: 0x4A4E69,
            bgColor: 0x5A5E79
        }
    },
    {
        level: "1.3",
        nextLevel: "2.1",
        name: "bootup",
        difficulty: 0.3,
        width: 250,
        height: 130,
        colors: {
            wallColor: 0x4A4E69,
            bgColor: 0x5A5E79
        }
    },
    {
        level: "2.1",
        nextLevel: "2.2",
        name: "deeper",
        cutscene: 1,
        difficulty: 0.5,
        width: 200,
        height: 200,
        colors: {
            wallColor: 0x8C1C13,
            bgColor: 0xBF4342
        }
    },
    {
        level: "2.2",
        nextLevel: "2.3",
        name: "deeper",
        difficulty: 0.5,
        width: 300,
        height: 250,
        colors: {
            wallColor: 0x8C1C13,
            bgColor: 0xBF4342
        }
    },
    {
        level: "2.3",
        nextLevel: "3.1",
        name: "deeper",
        difficulty: 0.5,
        width: 450,
        height: 300,
        colors: {
            wallColor: 0x8C1C13,
            bgColor: 0xBF4342
        }
    },
    {
        level: "3.1",
        nextLevel: "3.2",
        name: "signal",
        difficulty: 0.8,
        width: 600,
        height: 150,
        cutscene: 2,
        colors: {
            wallColor: 0x240046,
            bgColor: 0x3c096c
        }
    },
    {
        level: "3.2",
        nextLevel: "3.3",
        name: "signal",
        difficulty: 0.8,
        width: 800,
        height: 250,
        colors: {
            wallColor: 0x240046,
            bgColor: 0x3c096c
        }
    },
    {
        level: "3.3",
        nextLevel: "1.1",
        name: "signal",
        difficulty: 0.8,
        width: 900,
        height: 350,
        colors: {
            wallColor: 0x240046,
            bgColor: 0x3c096c
        }
    }
];