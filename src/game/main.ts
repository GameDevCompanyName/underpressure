import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { Game } from 'phaser';
import PhaserRaycaster from 'phaser-raycaster';
import { HEIGHT_PIXELS, WIDTH_PIXELS } from '../util/const';
import { UI_COLOR, numToCssHex } from '../util/ui';
import { Cutscene } from './scenes/Cutscene';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    width: WIDTH_PIXELS,
    height: HEIGHT_PIXELS,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: "#000000",
    scene: [MainMenu, MainGame, Cutscene],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 300, x: 0 }
        }
    },
    plugins: {
        scene: [
            {
                key: 'PhaserRaycaster',
                plugin: PhaserRaycaster,
                mapping: 'raycasterPlugin'
            }
        ]
    },
    pixelArt: true
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;
