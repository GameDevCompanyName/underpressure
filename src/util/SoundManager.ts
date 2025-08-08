import { Scene } from "phaser";
import { randomInRange } from "../gen/util";

export enum SOUNDS {
    THRUST = "thrust.ogg",
    DEATH = "death.wav",
    KICK = "kick.wav",
    CAVE = "cave.wav",
    WIN = "win.mp3"
}

export enum MUSIC {
    DRAMATIC = "dramatic.wav",
    MELANCHOLY = "melancholy.wav",
    PEACEFUL = "peaceful.wav",
    REFLECTION = "reflection.wav",
    STARGAZER = "stargazer.wav"
}

export default class SoundManager {
    private scene: Scene;
    private soundtrackValue: MUSIC;

    private thrustSound: Phaser.Sound.BaseSound;
    private caveAmbience: Phaser.Sound.BaseSound;
    private death: Phaser.Sound.BaseSound;
    private win: Phaser.Sound.BaseSound;
    private soundtrack: Phaser.Sound.BaseSound;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    preloadGameSounds() {
        this.scene.load.audio(SOUNDS.THRUST, "/assets/sounds/" + SOUNDS.THRUST);
        this.scene.load.audio(SOUNDS.DEATH, "/assets/sounds/" + SOUNDS.DEATH);
        this.scene.load.audio(SOUNDS.CAVE, "/assets/sounds/" + SOUNDS.CAVE);
        this.scene.load.audio(SOUNDS.WIN, "/assets/sounds/" + SOUNDS.WIN);
        this.scene.load.audio(SOUNDS.KICK, "/assets/sounds/" + SOUNDS.KICK);

        this.soundtrackValue = this.getRandomSountrack();
        this.scene.load.audio(this.soundtrackValue, "/assets/sounds/music/" + this.soundtrackValue);
    }

    initGameInstances() {
        this.thrustSound = this.scene.sound.add(SOUNDS.THRUST, { loop: true, volume: 0.2 });
        this.caveAmbience = this.scene.sound.add(SOUNDS.CAVE, { loop: true, volume: 0.2 });
        this.death = this.scene.sound.add(SOUNDS.DEATH, { loop: false, volume: 0.5 });
        this.win = this.scene.sound.add(SOUNDS.WIN, { loop: false, volume: 0.5 });
        this.soundtrack = this.scene.sound.add(this.soundtrackValue, { loop: true, volume: 1 });
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
        this.soundtrack.play();
    }

    pauseMusic() {
        this.soundtrack.pause();
    }

    stopSoundsAndPlayWin() {
        this.stopThrustSound();
        this.scene.tweens.add({ targets: [this.caveAmbience, this.soundtrack], volume: 0, duration: 500 });
        this.win.play();
    }

    stopSoundsAndPlayDeath() {
        this.stopThrustSound();
        this.scene.tweens.add({ targets: [this.caveAmbience, this.soundtrack], volume: 0, duration: 500 });
        this.death.play();
    }

}