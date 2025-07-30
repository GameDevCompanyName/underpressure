import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import PhaserRaycaster from 'phaser-raycaster';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.RESIZE,  // ВАЖНО: теперь Phaser будет менять размер canvas
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: '#ffff88',
    scene: [Preloader, Boot, MainMenu, MainGame, Game, GameOver],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,         // можешь включить true для отладки
            gravity: { y: 500, x: 0 }     // мы задаём thrust-движение, поэтому гравитацию отключаем
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
    }
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
