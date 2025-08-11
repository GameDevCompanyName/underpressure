import { Scene, GameObjects } from 'phaser';
import { HEIGHT_PIXELS, WIDTH_PIXELS } from '../../util/const';
import { createButton, createText, fadeFromBlack, fadeToBlack, UI_COLOR } from '../../util/ui';
import { Game } from './Game';
import { CutsceneInfo, LevelManager, Slide } from '../../util/LevelManager';

export class Cutscene extends Scene {
    private levelManager: LevelManager;

    private cutsceneInfo: CutsceneInfo;
    private slideIndex: number;

    private text: Phaser.GameObjects.Text;
    private button: Phaser.GameObjects.Container;

    private isTransition: boolean;

    constructor() {
        super('Cutscene');
    }

    preload() {
        this.levelManager = new LevelManager();
        this.cutsceneInfo = this.levelManager.getCurrentCutsceneInfo()!;
        this.load.image(this.getCutsceneBgName(), 'assets/bg/' + this.getCutsceneIndex() + '.jpg');
    }

    create() {
        this.slideIndex = 0;
        this.cutsceneInfo = this.levelManager.getCurrentCutsceneInfo()!;
        this.isTransition = false;

        this.cameras.main.setBackgroundColor(UI_COLOR.BG_DARK);

        this.drawBackgroundImage();

        this.drawCurrentSlide();
        fadeFromBlack(this, 500);
    }

    drawBackgroundImage() {
        const background = this.add.image(WIDTH_PIXELS / 2, HEIGHT_PIXELS / 2, this.getCutsceneBgName());
        background.setDisplaySize(WIDTH_PIXELS, HEIGHT_PIXELS);
        background.setScrollFactor(0);
    }

    getCurrentSlide(): Slide {
        return this.cutsceneInfo.cutscenes[this.slideIndex];
    }

    getCutsceneIndex(): string {
        return this.cutsceneInfo.index;
    }

    getCutsceneBgName(): string {
        return 'cs_bg_' + this.getCutsceneIndex();
    }

    nextSlide() {
        this.isTransition = true;
        this.tweens.add({
            targets: [this.text, this.button],
            alpha: 0,
            duration: 1000,
            ease: "Linear",
            onComplete: () => {
                this.text.destroy();
                this.button.destroy();
                this.slideIndex++;
                this.drawCurrentSlide();
                this.isTransition = false;
            }
        });
    }

    transitionToGame() {
        fadeToBlack(this, 1000, () => {
            this.scene.stop('Game');
            this.scene.start('Game');
        })
    }

    drawCurrentSlide() {
        const currentSlide: Slide = this.getCurrentSlide();
        this.text = createText(this, WIDTH_PIXELS / 2, HEIGHT_PIXELS / 2 - 80, currentSlide.text);
        this.button = createButton(this, WIDTH_PIXELS / 2, HEIGHT_PIXELS - 80, currentSlide.nextButtonText, () => {
            if (this.isTransition) {
                return;
            }

            if (this.slideIndex == this.cutsceneInfo.cutscenes.length - 1) {
                this.transitionToGame();
            } else {
                this.nextSlide();
            }
        });

        this.text.alpha = 0;
        this.button.alpha = 0;

        this.tweens.add({
            targets: [this.text, this.button],
            alpha: 1,
            duration: 1000,
            ease: "Linear",
            // onComplete: () => {

            // }
        });
    }

}

