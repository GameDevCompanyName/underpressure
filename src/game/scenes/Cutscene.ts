import { Scene, GameObjects } from 'phaser';
import { HEIGHT_PIXELS, WIDTH_PIXELS } from '../../util/const';
import { createButton, createText, fadeFromBlack, fadeToBlack, UI_COLOR } from '../../util/ui';
import { Game } from './Game';
import { CutsceneInfo, LevelManager, Slide, SlideButton } from '../../util/LevelManager';
import SoundManager, { getSoundManger } from '../../util/SoundManager';

export class Cutscene extends Scene {
    private levelManager: LevelManager;

    private cutsceneInfo: CutsceneInfo;
    private slideIndex: number;

    private text: Phaser.GameObjects.Text;
    private firstButton: Phaser.GameObjects.Container;
    private secondButton: Phaser.GameObjects.Container;

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

        getSoundManger(this).preloadGameSounds();

        this.cameras.main.setBackgroundColor(UI_COLOR.BG_DARK);

        this.drawBackgroundImage();

        this.drawCurrentSlide();
        fadeFromBlack(this, 500);

        if (this.cutsceneInfo.index.startsWith("end")) {
            getSoundManger(this).playHeroic();
        } else {
            getSoundManger(this).playCutscene();
        }
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
            targets: [this.text, this.firstButton, this.secondButton],
            alpha: 0,
            duration: 1000,
            ease: "Linear",
            onComplete: () => {
                this.text.destroy();
                this.firstButton.destroy();
                if (this.secondButton) {
                    this.secondButton.destroy();
                }
                this.slideIndex++;
                this.drawCurrentSlide();
                this.isTransition = false;
            }
        });
    }

    drawCurrentSlide() {
        const currentSlide: Slide = this.getCurrentSlide();
        this.text = createText(this, WIDTH_PIXELS / 2, HEIGHT_PIXELS / 2 - 80, currentSlide.text);

        const button1 = currentSlide.buttons[0];
        const button2 = currentSlide.buttons[1];

        if (!button2) {
            this.firstButton = this.createSlideButton(button1, WIDTH_PIXELS / 2);
        } else {
            this.firstButton = this.createSlideButton(button1, (WIDTH_PIXELS / 2) - 100);
            this.secondButton = this.createSlideButton(button2, (WIDTH_PIXELS / 2) + 100);
        }

        this.text.alpha = 0;
        this.firstButton.alpha = 0;
        if (this.secondButton) {
            this.secondButton.alpha = 0;
        }

        this.tweens.add({
            targets: [this.text, this.firstButton, this.secondButton],
            alpha: 1,
            duration: 1000,
            ease: "Linear",
            // onComplete: () => {

            // }
        });
    }

    createSlideButton(button: SlideButton, x: number): Phaser.GameObjects.Container {
        return createButton(this, x, HEIGHT_PIXELS - 80, button.text, () => {
            if (this.isTransition) {
                return;
            }

            if (this.slideIndex == this.cutsceneInfo.cutscenes.length - 1) {
                getSoundManger(this).stopCutscene();
                getSoundManger(this).stopHeroic();

                if (button.nextLevel) {
                    this.levelManager.saveLevel(button.nextLevel);
                    this.levelManager.launchCurrentLevelScene(this);
                } else {
                    this.levelManager.initClearSave();
                    fadeToBlack(this, 5000, () => {
                        this.scene.stop("MainMenu");
                        this.scene.start("MainMenu");
                    });
                }
            } else {
                this.nextSlide();
            }
        });
    }

}

