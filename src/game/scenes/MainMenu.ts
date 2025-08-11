import { Scene, GameObjects } from 'phaser';
import { HEIGHT_PIXELS, WIDTH_PIXELS } from '../../util/const';
import { createButton, fadeFromBlack, fadeToBlack, UI_COLOR } from '../../util/ui';
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

        this.cameras.main.setBackgroundColor(UI_COLOR.BG_LIGHT);

        createButton(this, WIDTH_PIXELS / 4, HEIGHT_PIXELS / 2 - 50, 'Начать', () => this.transitionToGame());
        createButton(this, WIDTH_PIXELS / 4, HEIGHT_PIXELS / 2 + 10, 'Рекорды', () => { });
        createButton(this, WIDTH_PIXELS / 4, HEIGHT_PIXELS / 2 + 80, 'Стереть сохранение', () => {
            this.levelManager.initClearSave();
        });

        fadeFromBlack(this, 1000);
    }

    transitionToGame() {
        this.levelManager.launchCurrentLevelScene(this);
    }

}
