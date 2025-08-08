import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import PhaserRaycaster from 'phaser-raycaster';
import { HEIGHT_PIXELS, WIDTH_PIXELS } from '../util/const';

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
    backgroundColor: '#ffff88',
    scene: [Preloader, Boot, MainMenu, MainGame, Game, GameOver],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 500, x: 0 }
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
