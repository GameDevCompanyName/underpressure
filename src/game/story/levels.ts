import { LevelInfo } from "../../util/LevelManager";

export const LEVELS: LevelInfo[] = [
    {
        level: "1.1",
        nextLevel: "1.2",
        name: "bootup",
        difficulty: 0.3,
        width: 90,
        height: 70,
        cutscene: "0",
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
        name: "signal",
        cutscene: "1",
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
        name: "signal",
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
        name: "signal",
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
        name: "deeper",
        difficulty: 0.8,
        width: 300,
        height: 400,
        cutscene: "2",
        colors: {
            wallColor: 0x240046,
            bgColor: 0x3c096c
        }
    },
    {
        level: "3.2",
        nextLevel: "4.1",
        name: "deeper",
        difficulty: 0.8,
        width: 400,
        height: 600,
        colors: {
            wallColor: 0x240046,
            bgColor: 0x3c096c
        }
    },
    {
        level: "4.1",
        nextLevel: "4.2",
        cutscene: "3",
        name: "hope",
        difficulty: 1.0,
        width: 600,
        height: 150,
        colors: {
            wallColor: 0x240046,
            bgColor: 0x3c096c
        }
    },
    {
        level: "4.2",
        nextLevel: "5",
        name: "hope",
        difficulty: 1.0,
        width: 800,
        height: 100,
        colors: {
            wallColor: 0x240046,
            bgColor: 0x3c096c
        }
    },
    {
        level: "5",
        nextLevel: "6",
        name: "hope",
        difficulty: 1.0,
        cutscene: "4",
        width: 500,
        height: 600,
        colors: {
            wallColor: 0x240046,
            bgColor: 0x3c096c
        }
    },
    {
        level: "6",
        nextLevel: "7",
        name: "hope",
        difficulty: 1.0,
        cutscene: "5",
        width: 1000,
        height: 150,
        colors: {
            wallColor: 0x240046,
            bgColor: 0x3c096c
        }
    },
    {
        level: "7",
        nextLevel: "8",
        name: "hope",
        difficulty: 1.0,
        cutscene: "6",
        width: 600,
        height: 600,
        colors: {
            wallColor: 0x240046,
            bgColor: 0x3c096c
        }
    },
    {
        level: "8",
        nextLevel: "9",
        name: "hope",
        difficulty: 1.0,
        cutscene: "7",
        width: 1200,
        height: 200,
        colors: {
            wallColor: 0x240046,
            bgColor: 0x3c096c
        }
    },
    {
        level: "9",
        nextLevel: "10",
        name: "hope",
        difficulty: 1.0,
        cutscene: "8",
        width: 700,
        height: 700,
        colors: {
            wallColor: 0x240046,
            bgColor: 0x3c096c
        }
    },
    {
        level: "10",
        nextLevel: "1.1",
        name: "hope",
        difficulty: 1.0,
        cutscene: "9",
        width: 500,
        height: 80,
        colors: {
            wallColor: 0x240046,
            bgColor: 0x3c096c
        }
    },
];