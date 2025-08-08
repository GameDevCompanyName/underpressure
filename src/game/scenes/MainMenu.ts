import { Scene, GameObjects } from 'phaser';
import { HEIGHT_PIXELS, WIDTH_PIXELS } from '../../util/const';
import { createButton, fadeFromBlack, fadeToBlack } from '../../util/ui';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    preload() {

    }

    create () {
        createButton(this, WIDTH_PIXELS / 4, HEIGHT_PIXELS / 2 - 50, 'Начать', () => this.transitionToScene('Game'));
        createButton(this, WIDTH_PIXELS / 4, HEIGHT_PIXELS / 2 + 10, 'Рекорды', () => {});

        fadeFromBlack(this, 1000);
    }

    transitionToScene(sceneName: string) {
        fadeToBlack(this, 1000, () => {
            this.scene.start(sceneName);
        })
    }

}
