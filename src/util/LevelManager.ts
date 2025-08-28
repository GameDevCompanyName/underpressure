import { Scene } from "phaser";
import { CUTSCENES } from "../game/story/cutscenes";
import { LEVELS } from "../game/story/levels";
import { WorldColors } from "./worldColorGeneration";
import { fadeToBlack } from "./ui";

const LS_GAME_PREFIX = 'underPressureSave_';
const CURRENT_STORY_LEVEL_KEY = LS_GAME_PREFIX + 'curStoryLevel';

export interface GameStateInfo {
    level: string;
    nextLevel?: string;
}

export interface LevelInfo extends GameStateInfo {
    name: string;
    width: number;
    height: number;
    bgname?: string;
    difficulty: number;
    colors: WorldColors;
}

export interface Slide {
    text: string;
    nextButtonText: string;
}

export interface CutsceneInfoSmall extends GameStateInfo {
    index: string;
}

export interface CutsceneInfo {
    index: string;
    cutscenes: Slide[]
}

export class LevelManager {

    saveLevel(level: string) {
        localStorage[CURRENT_STORY_LEVEL_KEY] = level;
    }

    getCurrentLevel(): string {
        let level = localStorage[CURRENT_STORY_LEVEL_KEY];
        if (!level) {
            this.initClearSave();
            level = localStorage[CURRENT_STORY_LEVEL_KEY];
        }
        return level;
    }

    isCurrentLevelCutscene(): boolean {
        const currentLevel = this.getCurrentLevel();
        const levelInfo = LEVELS.find(level => level.level === currentLevel);
        if ((levelInfo as LevelInfo).width) {
            return false;
        }
        return true;
    }

    getCurrentCutsceneInfo(): CutsceneInfo | null {
        if (!this.isCurrentLevelCutscene()) {
            return null;
        }
        const info = this.getGameStateInfo() as CutsceneInfoSmall;
        return CUTSCENES.find(scene => scene.index === info.index) || null;
    }

    getGameStateInfo(): GameStateInfo {
        const currentLevel = this.getCurrentLevel();
        return LEVELS.find(level => level.level === currentLevel)!;
    }

    getCurrentLevelInfo(): LevelInfo {
        if (!this.isCurrentLevelCutscene()) {
            return this.getGameStateInfo() as LevelInfo;
        } else {
            throw new Error('Current level is cutscene');
        }
    }

    saveNextLevel() {
        const info = this.getGameStateInfo();
        if (!info.nextLevel) {
            this.initClearSave();
        } else {
            this.saveLevel(info.nextLevel);
        }
    }

    launchCurrentLevelScene(scene: Scene) {
        fadeToBlack(scene, 1000, () => {
            const sceneName = this.isCurrentLevelCutscene() ? 'Cutscene' : 'Game';
            scene.scene.stop(sceneName);
            scene.scene.start(sceneName);
        });
    }

    initClearSave() {
        localStorage[CURRENT_STORY_LEVEL_KEY] = LEVELS[0].level;
    }

}
