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

export function numToCssHex(color: UI_COLOR): string {
    return "#" + color.toString(16);
}