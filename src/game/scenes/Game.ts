import { Scene } from 'phaser';
import { generateWorld, World, WorldCell } from '../../gen/common';
import { PathNode } from '../../gen/path';
import SoundManager from '../../util/SoundManager';
import { HEIGHT_PIXELS, WIDTH_PIXELS } from '../../util/const';

export class Game extends Scene {
    private soundManager: SoundManager;

    private raycasterPlugin: PhaserRaycaster;
    private raycaster: Raycaster;
    private ray: Raycaster.Ray;
    private intersections: Phaser.Geom.Point[];
    private someGraphics: Phaser.GameObjects.Graphics;

    private tileSize = 10;
    private playerSizeTiles = 3.5;
    private wallBlockColor = 0x4A4E69;
    private backgroundColor = 0x5A5E79;
    private endPlatformColor = 0x22223B;
    private platformColor = 0x9A8C98;
    private playerColor = 0x9A8C98;
    private barBGcolor = 0xF7F4EA;
    private barFillColor = 0x75C9C8;

    private lightColor = 0x999999;
    private engineLightColor = 0xBBAAAA;

    private wallGroup: Phaser.Physics.Arcade.StaticGroup;
    private world: World;

    private cursors: Partial<Phaser.Types.Input.Keyboard.CursorKeys>;
    private player: Phaser.GameObjects.Rectangle;
    private speedText: Phaser.GameObjects.Text;
    private fuelBarBackground: Phaser.GameObjects.Rectangle;
    private fuelBarForeground: Phaser.GameObjects.Rectangle;

    private readonly FUEL_MAX = 200;
    private readonly FUEL_CONSUMPTION_BASE = 10;
    private readonly REFUEL_RATE = 0.2;

    private isRefueling = false;
    private isThrusting = false;

    private readonly MIN_ZOOM = 0.5;
    private readonly MAX_ZOOM = 0.6;
    private readonly MAX_SPEED = 600;

    private fuel: number;

    constructor() {
        super('Game');
    }

    preload() {
        this.soundManager = new SoundManager(this);
        this.soundManager.preloadGameSounds();
    }

    create() {
        this.soundManager.initGameInstances();
        this.soundManager.startCaveAmbience();
        this.soundManager.playMusic();

        this.world = generateWorld();
        this.fuel = this.FUEL_MAX;

        this.wallGroup = this.physics.add.staticGroup();
        // this.createWalls();
        this.createWallBlocks();
        // this.drawPolygons();
        this.createPlayer();
        this.addStartPlatform();
        this.addEndPlatform();
        this.addRefuelPlatformsForIntermediateNodes();
        this.setupCamera();
        this.createUI();
        this.setupControls();
        this.setupWorldBounds();
        this.setupFadingText(1);

        this.raycaster = this.raycasterPlugin.createRaycaster();
        this.ray = this.raycaster.createRay({
            origin: {
                x: 0,
                y: 0
            },
            detectionRange: 500
        });
        this.raycaster.mapGameObjects(this.wallGroup.getChildren());
        //cast ray in all directions
        this.intersections = this.ray.castCircle();
        this.someGraphics = this.add.graphics({ lineStyle: { width: 1, color: 0x00ff00 }, fillStyle: { color: 0xffffff, alpha: 0.3 } });
    }

    private deltaSum = 0;

    update(time: number, delta: number) {
        this.handlePlayerMovement(delta);
        this.handleRefuel(delta);
        // this.updateSpeedText();
        this.updateCameraZoom();

        if (this.deltaSum > 50) {
            this.ray.setOrigin(this.player.x, this.player.y);
            this.intersections = this.ray.castCircle();
            this.redrawLight();
            this.deltaSum = 0;
        } else {
            this.deltaSum += delta;
        }

        this.updateFuelBar();
    }

    private handleRefuel(delta: number) {
        if (this.isRefueling) {
            if (this.fuel < this.FUEL_MAX) {
                this.fuel = Math.min(this.fuel + this.REFUEL_RATE * delta, this.FUEL_MAX);
            }
        }
        this.isRefueling = false;
    }

    private setupCamera(): void {
        this.cameras.main.setBackgroundColor(this.backgroundColor);
        this.cameras.main.startFollow(this.player);
        this.scale.on('resize', this.handleResize, this);
    }

    private handleResize(gameSize: Phaser.Structs.Size): void {
        const { width, height } = gameSize;
        this.cameras.resize(width, height);
    }

    // private drawPolygons(): void {
    //     for (const polygon of this.world.approxPolygons) {
    //         if (polygon.length < 3) continue; // пропускаем слишком маленькие полигоны

    //         const graphics = this.add.graphics();
    //         graphics.fillStyle(this.polygonColor, 0.5);
    //         graphics.beginPath();

    //         const [first, ...rest] = polygon;

    //         graphics.moveTo(first.x * this.tileSize, first.y * this.tileSize);
    //         for (const point of rest) {
    //             graphics.lineTo(point.x * this.tileSize, point.y * this.tileSize);
    //         }

    //         graphics.closePath();
    //         graphics.fillPath();

    //         this.wallGroup.add(graphics);
    //     }
    // }

    private createWalls(): void {
        for (let y = 0; y < this.world.height; y++) {
            for (let x = 0; x < this.world.width; x++) {
                if (this.world.map[y][x] === WorldCell.WALL) {
                    const posX = x * this.tileSize + this.tileSize / 2;
                    const posY = y * this.tileSize + this.tileSize / 2;
                    const wall = this.add.rectangle(posX, posY, this.tileSize, this.tileSize, this.wallBlockColor, 0.5);
                    this.wallGroup.add(wall);
                }
            }
        }
    }

    private createWallBlocks(): void {
        this.addExtraWallsAround();
        // create 4 walls - one from -1000 to (width + 1000) and from 0 to 1000 height
        // i need this walls to fully surround map with walls, so that player does not see the empty world arround

        for (const block of this.world.optimisedWallBlocks) {
            const widthCoords = block.rightBottom.x - block.leftTop.x;
            const widthPixels = (widthCoords + 1) * this.tileSize;
            const heightCoords = block.rightBottom.y - block.leftTop.y;
            const heightPixels = (heightCoords + 1) * this.tileSize;

            const xCenter = (block.rightBottom.x + block.leftTop.x) / 2;
            const yCenter = (block.rightBottom.y + block.leftTop.y) / 2;

            const posX = xCenter * this.tileSize + this.tileSize / 2;
            const posY = yCenter * this.tileSize + this.tileSize / 2;

            const wall = this.add.rectangle(posX, posY, widthPixels, heightPixels, this.wallBlockColor);

            this.wallGroup.add(wall);
        }
    }

    private addExtraWallsAround() {
        const arrayHeight = this.world.height;
        const arrayWidth = this.world.width;
        const tileSize = this.tileSize;

        const mapPixelWidth = arrayWidth * tileSize;
        const mapPixelHeight = arrayHeight * tileSize;

        // ===== Создаём 4 внешние стены =====
        const extraSize = 1000;

        // Верхняя стена
        const topWall = this.add.rectangle(
            mapPixelWidth / 2, // по центру карты
            -extraSize / 2,    // на -500 по Y
            mapPixelWidth + extraSize * 2, // шире карты
            extraSize,
            this.wallBlockColor
        );
        this.wallGroup.add(topWall);

        // Нижняя стена
        const bottomWall = this.add.rectangle(
            mapPixelWidth / 2,
            mapPixelHeight + extraSize / 2, // ниже карты
            mapPixelWidth + extraSize * 2,
            extraSize,
            this.wallBlockColor
        );
        this.wallGroup.add(bottomWall);

        // Левая стена
        const leftWall = this.add.rectangle(
            -extraSize / 2, // левее карты
            mapPixelHeight / 2,
            extraSize,
            mapPixelHeight + extraSize * 2,
            this.wallBlockColor
        );
        this.wallGroup.add(leftWall);

        // Правая стена
        const rightWall = this.add.rectangle(
            mapPixelWidth + extraSize / 2, // правее карты
            mapPixelHeight / 2,
            extraSize,
            mapPixelHeight + extraSize * 2,
            this.wallBlockColor
        );
        this.wallGroup.add(rightWall);
    }

    private addStartPlatform(): void {
        const startNode = this.world.pathInfo.nodes[0];
        this.addPlatformAtNode(startNode);
    }

    private addEndPlatform(): void {
        const endNode = this.world.pathInfo.nodes[this.world.pathInfo.nodes.length - 1];
        this.addPlatformAtNode(endNode);
    }

    private addPlatformAtNode(node: PathNode): void {
        const { x, y } = node.coords;

        const posX = x * this.tileSize;
        const posY = y * this.tileSize + (this.tileSize * this.playerSizeTiles) / 2;

        const platform = this.add.rectangle(
            posX,
            posY + 5, // немного ниже центра игрока
            this.tileSize * this.playerSizeTiles,
            10,
            this.endPlatformColor
        );

        this.physics.add.existing(platform, true);
        this.physics.add.collider(this.player, platform);
    }

    private addRefuelPlatformAtNode(node: PathNode): void {
        const { x, y } = node.coords;

        const posX = x * this.tileSize;
        const posY = y * this.tileSize + (this.tileSize * this.playerSizeTiles) / 2;

        const platform = this.add.rectangle(
            posX,
            posY + 5,
            this.tileSize * this.playerSizeTiles,
            10,
            this.platformColor // зелёная платформа для заправки
        );

        this.physics.add.existing(platform, true);
        this.physics.add.collider(this.player, platform, () => {
            if (!this.isRefueling) {
                this.isRefueling = true;
            }
        });
    }

    private addRefuelPlatformsForIntermediateNodes(): void {
        const nodes = this.world.pathInfo.nodes;
        for (let i = 1; i < nodes.length - 1; i++) {
            this.addRefuelPlatformAtNode(nodes[i]);
        }
    }

    private createPlayer(): void {
        const startPosition = this.getPlayerStartPosition();
        this.player = this.createPlayerRectangle(startPosition);
        this.configurePlayerPhysics(this.player);
        this.setupPlayerCollisions(this.player);
    }

    private getPlayerStartPosition(): Phaser.Math.Vector2 {
        const startNode = this.world.pathInfo.nodes[0];
        const { x, y } = startNode.coords;

        return new Phaser.Math.Vector2(
            x * this.tileSize,
            y * this.tileSize
        );
    }

    private createPlayerRectangle(position: Phaser.Math.Vector2): Phaser.GameObjects.Rectangle {
        const player = this.add.rectangle(
            position.x,
            position.y,
            this.tileSize * this.playerSizeTiles,
            this.tileSize * this.playerSizeTiles,
            this.playerColor // Можно заменить на this.playerColor если хочешь
        );

        this.physics.add.existing(player);
        return player;
    }

    private configurePlayerPhysics(player: Phaser.GameObjects.Rectangle): void {
        const body = player.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        body.setBounce(0);
        body.setDrag(50);
        body.setMaxVelocity(this.MAX_SPEED);
        body.setAllowGravity(true); // Если не нужен гравитационный эффект — выключи
    }

    private setupPlayerCollisions(player: Phaser.GameObjects.Rectangle): void {
        this.physics.add.collider(player, this.wallGroup, () => {
            // this.scene.restart(); // TODO: действие при столкновении со стеной
        });
    }

    private createUI(): void {
        const barWidth = this.tileSize * this.playerSizeTiles * 1.5;
        const barHeight = 10;

        this.fuelBarBackground = this.add.rectangle(0, 0, barWidth, barHeight, this.barBGcolor, 0.7);
        this.fuelBarForeground = this.add.rectangle(0, 0, barWidth, barHeight, this.barFillColor, 1.0);

        this.fuelBarBackground.setOrigin(0.5, 0);
        this.fuelBarForeground.setOrigin(0.5, 0);
    }

    private setupControls(): void {
        this.cursors = this.input.keyboard!.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            up: Phaser.Input.Keyboard.KeyCodes.W,
        });
    }

    private setupWorldBounds(): void {
        const worldWidth = this.tileSize * this.world.width;
        const worldHeight = this.tileSize * this.world.height;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    }

    private handlePlayerMovement(delta: number): void {
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        const dt = delta / 1000;

        body.acceleration.set(0);

        if (this.fuel <= 0) {
            this.isThrusting = false;
            this.soundManager.stopThrustSound();
            return;
        }

        let dirX = 0;
        let dirY = 0;

        if (this.cursors.left?.isDown) dirX -= 1;
        if (this.cursors.right?.isDown) dirX += 1;
        if (this.cursors.up?.isDown) dirY -= 1;

        if (dirX !== 0) body.acceleration.x = dirX * 300;
        if (dirY !== 0) body.acceleration.y = dirY * 800;

        const directionCount = Math.abs(dirX) + Math.abs(dirY);

        if (directionCount > 0 && this.fuel > 0) {
            const multiplier = directionCount === 2 ? 1.5 : 1;
            this.fuel -= this.FUEL_CONSUMPTION_BASE * multiplier * dt;
            this.fuel = Math.max(this.fuel, 0);
            this.isThrusting = true;
            this.soundManager.startThrustSound();
        } else {
            this.isThrusting = false;
            this.soundManager.stopThrustSound();
        }
    }

    private updateFuelBar(): void {
        // Вычисляем ширину полосы пропорционально размеру игрока и масштабируем на 1.5
        const barWidth = this.tileSize * this.playerSizeTiles * 1.5;

        // Координата центра игрока по X — это центр полосы, 
        // а setPosition ставит левый верхний угол, поэтому смещаем влево на половину ширины
        const barX = this.player.x;

        // Позиция по Y под игроком — как было, чуть ниже
        const barY = this.player.y + this.tileSize * this.playerSizeTiles;

        const fuelRatio = Phaser.Math.Clamp(this.fuel / this.FUEL_MAX, 0, 1);

        // Устанавливаем позицию полосы (левый верхний угол)
        this.fuelBarBackground.setPosition(barX, barY);
        this.fuelBarForeground.setPosition(barX, barY);

        // Устанавливаем ширину заливки в зависимости от процента топлива
        this.fuelBarForeground.width = barWidth * fuelRatio;
    }

    private updateSpeedText(): void {
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        const vx = body.velocity.x.toFixed(0);
        const vy = body.velocity.y.toFixed(0);
        this.speedText.setPosition(this.player.x, this.player.y - this.tileSize / 2 - 8);
        this.speedText.setText(`vx: ${vx}\nvy: ${vy}`);
    }

    private updateCameraZoom(): void {
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        const velocityX = body.velocity.x;
        const t = Phaser.Math.Clamp(velocityX / this.MAX_SPEED, 0, 1);
        const zoom = Phaser.Math.Linear(this.MIN_ZOOM, this.MAX_ZOOM, t);
        this.cameras.main.setZoom(zoom);
    }

    private redrawLight() {
        this.someGraphics.clear();
        if (!this.isThrusting) {
            this.someGraphics.fillStyle(this.lightColor, 0.5);
        } else {
            this.someGraphics.fillStyle(this.engineLightColor, 0.5);
        }
        this.someGraphics.fillPoints(this.intersections);

        this.someGraphics.strokeCircleShape(new Phaser.Geom.Circle(
            this.ray.origin.x,
            this.ray.origin.y,
            this.ray.detectionRange
        ));
    }

    private setupFadingText(levelNumber: number) {
        const titleText = "LEVEL " + levelNumber;
        const titleTextObject: Phaser.GameObjects.Text = this.add.text(
            this.player.x - WIDTH_PIXELS / 2,
            this.player.y + HEIGHT_PIXELS - 100,
            titleText,
            { fontFamily: 'Courier New', fontStyle: "bold", fontSize: 40 }
        );

        const musicText = "Destructo20 - " + this.soundManager.getTrackName();
        const musicTextObject: Phaser.GameObjects.Text = this.add.text(
            this.player.x - WIDTH_PIXELS / 2,
            this.player.y + HEIGHT_PIXELS - 50,
            musicText,
            { fontFamily: 'Courier New', fontSize: 26 }
        );

        setTimeout(() => {
            this.tweens.add({
                targets: [musicTextObject, titleTextObject],
                repeat: 0,
                duration: 1000,
                ease: "Linear",
                yoyo: false,
                alpha: {
                    getStart: () => 1,
                    getEnd: () => 0
                },
                onComplete: () => {
                    musicTextObject.destroy();
                    titleTextObject.destroy();
                }
            })
        }, 2000)
    }
}
