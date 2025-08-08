import { Scene } from "phaser";

export enum UI_COLOR {
    MAIN = 0x134074,
    SECONDARY = 0x13315C,
    SURFACE = 0xEEF4ED,
    BG_LIGHT = 0x8DA9C4,
    BG_DARK = 0x0B2545
}

export function createButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    onClick: () => void
) {
    const buttonText = scene.add.text(0, 0, text, {
        fontSize: '26px',
        fontFamily: 'Courier New',
        fontStyle: "bold",
        color: numToCssHex(UI_COLOR.SURFACE),
    }).setOrigin(0.5);

    const buttonBg = scene.add.rectangle(0, 0, buttonText.width + 20, 50, UI_COLOR.SECONDARY);
    buttonBg.setStrokeStyle(4, UI_COLOR.BG_DARK);

    const container = scene.add.container(x, y, [buttonBg, buttonText]);
    container.setSize(buttonBg.width, buttonBg.height);
    container.setInteractive({ useHandCursor: true })
        .on('pointerover', () => buttonBg.setFillStyle(UI_COLOR.BG_DARK))
        .on('pointerout', () => buttonBg.setFillStyle(UI_COLOR.SECONDARY))
        .on('pointerdown', onClick);

    return container;
}

export function fadeToBlack(
    scene: Phaser.Scene,
    duration: number = 1000,
    onComplete?: () => void
): Phaser.Tweens.Tween {
    // Создаем Render Texture на весь экран
    const rt = scene.add.renderTexture(0, 0, scene.sys.game.scale.gameSize.width * 3, scene.sys.game.scale.gameSize.height * 3)
        .setOrigin(0.5)
        .setDepth(9999)
        .setScrollFactor(0)
        .setAlpha(0) // Начинаем с прозрачного
        .fill(0x000000); // Заливаем черным

    return scene.tweens.add({
        targets: rt,
        alpha: 1,
        duration,
        ease: "Linear",
        onComplete: () => {
            onComplete?.();
            // Не уничтожаем сразу, чтобы анимация не прерывалась
            scene.time.delayedCall(100, () => rt.destroy());
        }
    });
}

export function fadeFromBlack(
    scene: Scene,
    duration: number = 1500,
    onComplete?: () => void
): Phaser.Tweens.Tween {
    // Создаем/сбрасываем оверлей
    const overlay = scene.add.rectangle(
        0, 0,
        scene.cameras.main.width * 3,
        scene.cameras.main.height * 3,
        0x000000,
        1
    )
    .setOrigin(0.5)
    .setDepth(9999)
    .setScrollFactor(0)
    .setVisible(true);

    return scene.tweens.add({
        targets: overlay,
        alpha: 0,
        duration,
        ease: "Linear",
        onComplete: () => {
            overlay.destroy();
            onComplete?.();
        }
    });
}

export function numToCssHex(color: UI_COLOR): string {
    return "#" + color.toString(16);
}