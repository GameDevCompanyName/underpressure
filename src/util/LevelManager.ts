import { Scene } from "phaser";
import { CUTSCENES } from "../game/story/cutscenes";
import { LEVELS } from "../game/story/levels";
import { WorldColors } from "./worldColorGeneration";
import { fadeToBlack } from "./ui";

const LS_GAME_PREFIX = 'underPressureSave_';
const CURRENT_STORY_LEVEL_KEY = LS_GAME_PREFIX + 'curStoryLevel';

export interface LevelInfo {
    level: string;
    nextLevel: string;
    name: string;
    width: number;
    height: number;
    difficulty: number;
    cutscene?: number;
    colors: WorldColors;
}

export interface Slide {
    text: string;
    nextButtonText: string;
    bgName: string | null;
}

export interface CutsceneInfo {
    index: number;
    cutscenes: Slide[]
}

export class LevelManager {

    saveLevel(level: string) {
        localStorage[CURRENT_STORY_LEVEL_KEY] = level;
    }

    getCurrentLevel(): string {
        let level = localStorage[CURRENT_STORY_LEVEL_KEY];
        if (!level) {
            level = "1";
            this.saveLevel(level);
        }
        return level;
    }

    getCurrentCutsceneInfo(): CutsceneInfo | null {
        const currentLevelInfo = this.getCurrentLevelInfo();
        if (currentLevelInfo.cutscene === undefined) {
            return null;
        }
        return CUTSCENES.find(scene => scene.index === currentLevelInfo.cutscene) || null;
    }

    getCurrentLevelInfo(): LevelInfo {
        const currentLevel = this.getCurrentLevel();
        return LEVELS.find(level => level.level == currentLevel)!;
    }

    saveNextLevel() {
        const info = this.getCurrentLevelInfo();
        this.saveLevel(info.nextLevel);
    }

    launchCurrentLevelScene(scene: Scene) {
        const cutscene = this.getCurrentCutsceneInfo();

        fadeToBlack(scene, 1000, () => {
            const sceneName = cutscene ? 'Cutscene' : 'Game';
            scene.scene.stop(sceneName);
            scene.scene.start(sceneName);
        });
    }

}
