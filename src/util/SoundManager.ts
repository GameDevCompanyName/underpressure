import { Scene } from "phaser";
import { randomInRange } from "../gen/util";

let SOUND_MANAGER: SoundManager | undefined;

export enum SOUNDS {
    THRUST = "thrust.ogg",
    DEATH = "death.wav",
    KICK = "kick.wav",
    CAVE = "cave.wav",
    WIN = "win.mp3",
    BUTTON = "button.wav"
}

export enum MUSIC {
    DRAMATIC = "dramatic.wav",
    MELANCHOLY = "melancholy.wav",
    PEACEFUL = "peaceful.wav",
    REFLECTION = "reflection.wav",
    STARGAZER = "stargazer.wav",
    MENU = "menu.mp3",
    HEROIC = "heroic.wav",
    CUTSCENE = "cutscene.wav"
}

export default class SoundManager {
    scene: Scene;
    private soundtrackValue: MUSIC;

    private thrustSound: Phaser.Sound.BaseSound;
    private caveAmbience: Phaser.Sound.BaseSound;
    private death: Phaser.Sound.BaseSound;
    private win: Phaser.Sound.BaseSound;
    private soundtrack: Phaser.Sound.BaseSound;
    private button: Phaser.Sound.BaseSound;
    private menu: Phaser.Sound.BaseSound;
    private heroic: Phaser.Sound.BaseSound;
    private cutscene: Phaser.Sound.BaseSound;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    preloadGameSounds() {
        this.scene.load.audio(SOUNDS.THRUST, "/assets/sounds/" + SOUNDS.THRUST);
        this.scene.load.audio(SOUNDS.DEATH, "/assets/sounds/" + SOUNDS.DEATH);
        this.scene.load.audio(SOUNDS.CAVE, "/assets/sounds/" + SOUNDS.CAVE);
        this.scene.load.audio(SOUNDS.WIN, "/assets/sounds/" + SOUNDS.WIN);
        this.scene.load.audio(SOUNDS.KICK, "/assets/sounds/" + SOUNDS.KICK);
        this.scene.load.audio(SOUNDS.BUTTON, "/assets/sounds/" + SOUNDS.BUTTON);
        this.scene.load.audio(MUSIC.MENU, "/assets/sounds/music/" + MUSIC.MENU);
        this.scene.load.audio(MUSIC.HEROIC, "/assets/sounds/music/" + MUSIC.HEROIC);
        this.scene.load.audio(MUSIC.CUTSCENE, "/assets/sounds/music/" + MUSIC.CUTSCENE);
        this.scene.load.audio(MUSIC.DRAMATIC, "/assets/sounds/music/" + MUSIC.DRAMATIC);
        this.scene.load.audio(MUSIC.MELANCHOLY, "/assets/sounds/music/" + MUSIC.MELANCHOLY);
        this.scene.load.audio(MUSIC.PEACEFUL, "/assets/sounds/music/" + MUSIC.PEACEFUL);
        this.scene.load.audio(MUSIC.REFLECTION, "/assets/sounds/music/" + MUSIC.REFLECTION);
        this.scene.load.audio(MUSIC.STARGAZER, "/assets/sounds/music/" + MUSIC.STARGAZER);

        this.soundtrackValue = this.getRandomSountrack();
    }

    initInstances() {
        this.thrustSound = this.scene.sound.add(SOUNDS.THRUST, { loop: true, volume: 0.12 });
        this.caveAmbience = this.scene.sound.add(SOUNDS.CAVE, { loop: true, volume: 0.1 });
        this.death = this.scene.sound.add(SOUNDS.DEATH, { loop: false, volume: 0.5 });
        this.win = this.scene.sound.add(SOUNDS.WIN, { loop: false, volume: 0.5 });
        this.button = this.scene.sound.add(SOUNDS.BUTTON, { loop: false, volume: 1 });
        this.menu = this.scene.sound.add(MUSIC.MENU, { loop: true, volume: 1 });
        this.heroic = this.scene.sound.add(MUSIC.HEROIC, { loop: true, volume: 0.5 });
        this.cutscene = this.scene.sound.add(MUSIC.CUTSCENE, { loop: true, volume: 0.5 });
    }

    getTrackName(): string {
        const name = this.soundtrackValue.toString();
        return name.substring(0, name.length - 4);
    }

    getRandomSountrack(): MUSIC {
        const random = Math.floor(randomInRange(0.5, 5.5));
        switch (random) {
            case 1: return MUSIC.DRAMATIC;
            case 2: return MUSIC.MELANCHOLY;
            case 3: return MUSIC.PEACEFUL;
            case 4: return MUSIC.REFLECTION;
            default: return MUSIC.STARGAZER;
        }
    }

    startThrustSound() {
        if (!this.thrustSound.isPlaying) {
            this.thrustSound.play();
        }
    }

    stopThrustSound() {
        this.thrustSound.pause();
    }

    startCaveAmbience() {
        this.caveAmbience.play();
    }

    stopCaveAmbience() {
        this.caveAmbience.pause();
    }

    playMusic() {
        console.log('play soundtrack');
        if (this.soundtrack) {
            this.soundtrack.stop();
            this.soundtrack.destroy();
        }
        this.soundtrack = this.scene.sound.add(this.soundtrackValue, { loop: true, volume: 1 });
        this.soundtrack.play();
    }

    pauseMusic() {
        console.log('stop soundtrack');
        if (this.soundtrack) {
            this.soundtrack.stop();
        }
    }

    stopSoundsAndPlayWin() {
        this.stopThrustSound();
        this.scene.tweens.add({
            targets: [this.caveAmbience, this.soundtrack], volume: 0, duration: 500, onComplete: () => {
                this.pauseMusic();
            }
        });
        this.win.play();
    }

    stopSoundsAndPlayDeath() {
        this.stopThrustSound();
        this.scene.tweens.add({ targets: [this.caveAmbience, this.soundtrack], volume: 0, duration: 500 });
        this.death.play();
    }

    playButton() {
        this.button.play(undefined, { seek: 0.07 });
    }

    playMenu() {
        this.menu.play();
    }

    stopMenu() {
        this.scene.tweens.add({
            targets: [this.menu], volume: 0, duration: 500, onComplete: () => {
                this.menu.stop();
            }
        });
    }

    playCutscene() {
        this.cutscene.play(undefined, { seek: 1.8, volume: 0.5 });
        this.scene.tweens.add({ targets: [this.cutscene], volume: 0.5, duration: 2000 });
    }

    stopCutscene() {
        this.scene.tweens.add({
            targets: [this.cutscene], volume: 0, duration: 800, onComplete: () => {
                this.cutscene.stop();
            }
        });
    }

    playHeroic() {
        this.heroic.play();
        this.scene.tweens.add({ targets: [this.heroic], volume: 1, duration: 1000 });
    }

    stopHeroic() {
        this.scene.tweens.add({
            targets: [this.heroic], volume: 0, duration: 5000, onComplete: () => {
                this.heroic.stop();
            }
        });
    }

}

export function getSoundManger(scene: Scene): SoundManager {
    if (!SOUND_MANAGER) {
        SOUND_MANAGER = new SoundManager(scene);
    }
    SOUND_MANAGER.scene = scene;
    return SOUND_MANAGER;
}
