import StartGame from './game/main';

const baseUrl = './assets/';

const file1 = new FontFace(
    "pixelizer",
    "url(" + baseUrl + "pixelizer.ttf) format('truetype')"
);
document.fonts.add(file1);
file1.load().then(() => {
    const font2 = new FontFace(
        "sonic",
        "url(" + baseUrl + "sonic.ttf) format('truetype')"
    );
    document.fonts.add(font2);
    font2.load().then(() => {
        setTimeout(() => {
            StartGame('game-container');
        }, 0);
    });
});