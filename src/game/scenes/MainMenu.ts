import { Scene, GameObjects } from 'phaser';
import { HEIGHT_PIXELS, WIDTH_PIXELS } from '../../util/const';
import { createButton, createText, fadeFromBlack, fadeToBlack, UI_COLOR } from '../../util/ui';
import { Game } from './Game';
import { LevelManager } from '../../util/LevelManager';
import { getSoundManger } from '../../util/SoundManager';

export class MainMenu extends Scene {

    private levelManager: LevelManager;

    constructor() {
        super('MainMenu');
    }

    preload() {
        getSoundManger(this).preloadGameSounds();
        this.load.image("menubg", 'assets/bg/end2.jpg');
    }

    create() {
        getSoundManger(this).initInstances();
        this.levelManager = new LevelManager();

        this.cameras.main.setBackgroundColor(UI_COLOR.BG_LIGHT);

        this.drawBackgroundImage();

        createButton(this, WIDTH_PIXELS / 4, HEIGHT_PIXELS - 80, this.getStartButtonName(), () => this.transitionToGame());
        createText(this, WIDTH_PIXELS / 2, 120, "UNDERPRESSURE", 56).setAlpha(0.7);
        // createButton(this, WIDTH_PIXELS / 4, HEIGHT_PIXELS / 2 + 100, 'Статистика', () => { }); TODO

        fadeFromBlack(this, 1000);
        getSoundManger(this).playMenu();
    }

    drawBackgroundImage() {
        const background = this.add.image(WIDTH_PIXELS / 2, HEIGHT_PIXELS / 2, "menubg");
        background.setDisplaySize(WIDTH_PIXELS, HEIGHT_PIXELS);
        background.setScrollFactor(0);
    }

    getStartButtonName(): string {
        const level = this.levelManager.getCurrentLevel();
        if (level === '1.1_c') {
            return 'Новая игра';
        } else {
            return 'Продолжить ' + level;
        }
    }

    transitionToGame() {
        this.levelManager.launchCurrentLevelScene(this);
        getSoundManger(this).stopMenu();
    }

    destroy() {
        getSoundManger(this).stopMenu();
    }

}
