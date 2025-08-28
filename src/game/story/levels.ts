import { GameStateInfo } from "../../util/LevelManager";

export const LEVELS = [
    {
        index: "0",
        level: "1.1_c",
        nextLevel: "1.1"
    },
    {
        level: "1.1",
        nextLevel: "1.2",
        name: "bootup",
        bgname: "rocks",
        difficulty: 0.3,
        width: 90,
        height: 70,
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
        nextLevel: "2.1_c",
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
        index: "1",
        level: "2.1_c",
        nextLevel: "2.1"
    },
    {
        level: "2.1",
        nextLevel: "2.2",
        name: "deeper",
        bgname: "rocks",
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
        nextLevel: "3_c",
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
        index: "2",
        level: "3_c",
        nextLevel: "3"
    },
    {
        level: "3",
        nextLevel: "4.1",
        name: "deeper",
        bgname: "rust",
        difficulty: 0.8,
        width: 300,
        height: 400,
        colors: {
            wallColor: 0x4f000b,
            bgColor: 0x720026
        }
    },
    {
        index: "3",
        level: "4_c",
        nextLevel: "4"
    },
    {
        level: "4.1",
        nextLevel: "4.2",
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
        nextLevel: "5_c",
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
        index: "4",
        level: "5_c",
        nextLevel: "5"
    },
    {
        level: "5",
        nextLevel: "6_c",
        name: "hope",
        bgname: "rust",
        difficulty: 1.0,
        width: 300,
        height: 300,
        colors: {
            wallColor: 0x461220,
            bgColor: 0x8c2f39
        }
    },
    {
        index: "5",
        level: "6_c",
        nextLevel: "6"
    },
    {
        level: "6",
        nextLevel: "7_c",
        name: "hope",
        bgname: "metal",
        difficulty: 1.0,
        width: 400,
        height: 300,
        colors: {
            wallColor: 0x364958,
            bgColor: 0x3b6064
        }
    },
    {
        index: "6",
        level: "7_c",
        nextLevel: "7"
    },
    {
        level: "7",
        nextLevel: "8_c",
        name: "hope",
        bgname: "metal",
        difficulty: 1.0,
        width: 600,
        height: 400,
        colors: {
            wallColor: 0x0b2545,
            bgColor: 0x134074
        }
    },
    {
        index: "7",
        level: "8_c",
        nextLevel: "8"
    },
    {
        level: "8",
        nextLevel: "9_c",
        name: "hope",
        bgname: "metal",
        difficulty: 1.0,
        width: 200,
        height: 700,
        colors: {
            wallColor: 0x293d33,
            bgColor: 0x4c6e5d
        }
    },
    {
        index: "8",
        level: "9_c",
        nextLevel: "9"
    },
    {
        level: "9",
        nextLevel: "10_c",
        name: "hope",
        difficulty: 1.0,
        width: 800,
        height: 350,
        colors: {
            wallColor: 0x252323,
            bgColor: 0x70798c
        }
    },
    {
        index: "9",
        level: "10_c",
        nextLevel: "10"
    },
    {
        level: "10",
        nextLevel: "choice",
        name: "hope",
        difficulty: 1.0,
        width: 800,
        height: 100,
        colors: {
            wallColor: 0x212529,
            bgColor: 0x343a40
        }
    },
    {
        index: "choice",
        level: "choice"
    },
    {
        index: "ending1",
        level: "ending1"
    },
    {
        index: "ending2",
        level: "ending2"
    },
];