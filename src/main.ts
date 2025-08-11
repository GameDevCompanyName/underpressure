import StartGame from './game/main';

const file1 = new FontFace(
    "pixelizer",
    "url(/assets/pixelizer.ttf) format('truetype')"
);
document.fonts.add(file1);
file1.load().then(() => {
    const font2 = new FontFace(
        "sonic",
        "url(/assets/sonic.ttf) format('truetype')"
    );
    document.fonts.add(font2);
    font2.load().then(() => {
        setTimeout(() => {
            StartGame('game-container');
        }, 0);
    });
});