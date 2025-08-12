import { LevelInfo } from "../../util/LevelManager";

export const LEVELS: LevelInfo[] = [
    {
        level: "1.1",
        nextLevel: "1.2",
        name: "bootup",
        bgname: "rocks",
        difficulty: 0.3,
        width: 90,
        height: 70,
        cutscene: "0",
        colors: {
            wallColor: 0x582f0e,
            bgColor: 0x7f4f24
        }
    },
    {
        level: "1.2",
        nextLevel: "1.3",
        name: "bootup",
        bgname: "rocks",
        difficulty: 0.3,
        width: 150,
        height: 100,
        colors: {
            wallColor: 0x582f0e,
            bgColor: 0x7f4f24
        }
    },
    {
        level: "1.3",
        nextLevel: "2.1",
        name: "bootup",
        bgname: "rocks",
        difficulty: 0.3,
        width: 250,
        height: 130,
        colors: {
            wallColor: 0x582f0e,
            bgColor: 0x7f4f24
        }
    },
    {
        level: "2.1",
        nextLevel: "2.2",
        name: "deeper",
        bgname: "rocks",
        cutscene: "1",
        difficulty: 0.5,
        width: 80,
        height: 400,
        colors: {
            wallColor: 0x4e4345,
            bgColor: 0x745d4d
        }
    },
    {
        level: "2.2",
        nextLevel: "2.3",
        name: "deeper",
        bgname: "rocks",
        difficulty: 0.5,
        width: 100,
        height: 600,
        colors: {
            wallColor: 0x4e4345,
            bgColor: 0x745d4d
        }
    },
    {
        level: "2.3",
        nextLevel: "3",
        name: "deeper",
        bgname: "rocks",
        difficulty: 0.5,
        width: 150,
        height: 800,
        colors: {
            wallColor: 0x4e4345,
            bgColor: 0x745d4d
        }
    },
    {
        level: "3",
        nextLevel: "4.1",
        name: "deeper",
        bgname: "rust",
        difficulty: 0.8,
        width: 300,
        height: 400,
        cutscene: "2",
        colors: {
            wallColor: 0x4f000b,
            bgColor: 0x720026
        }
    },
    {
        level: "4.1",
        nextLevel: "4.2",
        cutscene: "3",
        name: "hope",
        bgname: "rust",
        difficulty: 1.0,
        width: 600,
        height: 150,
        colors: {
            wallColor: 0x4f000b,
            bgColor: 0x720026
        }
    },
    {
        level: "4.2",
        nextLevel: "5",
        name: "hope",
        bgname: "rust",
        difficulty: 1.0,
        width: 800,
        height: 100,
        colors: {
            wallColor: 0x4f000b,
            bgColor: 0x720026
        }
    },
    {
        level: "5",
        nextLevel: "6",
        name: "hope",
        bgname: "rust",
        difficulty: 1.0,
        cutscene: "4",
        width: 500,
        height: 600,
        colors: {
            wallColor: 0x461220,
            bgColor: 0x8c2f39
        }
    },
    {
        level: "6",
        nextLevel: "7",
        name: "hope",
        bgname: "metal",
        difficulty: 1.0,
        cutscene: "5",
        width: 1000,
        height: 150,
        colors: {
            wallColor: 0x364958,
            bgColor: 0x3b6064
        }
    },
    {
        level: "7",
        nextLevel: "8",
        name: "hope",
        bgname: "metal",
        difficulty: 1.0,
        cutscene: "6",
        width: 600,
        height: 600,
        colors: {
            wallColor: 0x0b2545,
            bgColor: 0x134074
        }
    },
    {
        level: "8",
        nextLevel: "9",
        name: "hope",
        bgname: "metal",
        difficulty: 1.0,
        cutscene: "7",
        width: 1200,
        height: 200,
        colors: {
            wallColor: 0x293d33,
            bgColor: 0x4c6e5d
        }
    },
    {
        level: "9",
        nextLevel: "10",
        name: "hope",
        difficulty: 1.0,
        cutscene: "8",
        width: 1000,
        height: 400,
        colors: {
            wallColor: 0x252323,
            bgColor: 0x70798c
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
            wallColor: 0x212529,
            bgColor: 0x343a40
        }
    },
];