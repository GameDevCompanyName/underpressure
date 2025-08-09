import { Scene, GameObjects } from 'phaser';
import { HEIGHT_PIXELS, WIDTH_PIXELS } from '../../util/const';
import { createButton, fadeFromBlack, fadeToBlack } from '../../util/ui';
import { Game } from './Game';
import { LevelManager } from '../../util/LevelManager';

export class MainMenu extends Scene {

    private levelManager: LevelManager;

    constructor() {
        super('MainMenu');
    }

    preload() {

    }

    create() {
        this.levelManager = new LevelManager();
        
        createButton(this, WIDTH_PIXELS / 4, HEIGHT_PIXELS / 2 - 50, 'Начать', () => this.transitionToGame());
        createButton(this, WIDTH_PIXELS / 4, HEIGHT_PIXELS / 2 + 10, 'Рекорды', () => { });

        fadeFromBlack(this, 1000);
    }

    transitionToGame() {
        this.levelManager.launchCurrentLevelScene(this);
    }

}
