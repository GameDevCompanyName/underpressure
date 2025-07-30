import { Scene } from 'phaser';
import { generateWorld, World, WorldCell } from '../../gen/common';
import { PathNode } from '../../gen/path';

export class Game extends Scene {
    raycasterPlugin: PhaserRaycaster;

    private tileSize = 10;
    private playerSizeTiles = 3.5;
    private wallColor = 0x8b4513;

    private wallGroup: Phaser.Physics.Arcade.StaticGroup;
    private world: World;

    private cursors: Partial<Phaser.Types.Input.Keyboard.CursorKeys>;
    private player: Phaser.GameObjects.Rectangle;
    private speedText: Phaser.GameObjects.Text;
    private fuelBarBackground: Phaser.GameObjects.Rectangle;
    private fuelBarForeground: Phaser.GameObjects.Rectangle;

    private readonly FUEL_MAX = 100;
    private readonly FUEL_CONSUMPTION_BASE = 10;
    private readonly REFUEL_RATE = 0.2;

    private isRefueling = false;

    private readonly MIN_ZOOM = 0.9;
    private readonly MAX_ZOOM = 1.1;
    private readonly MAX_SPEED = 600;

    private fuel: number;

    constructor() {
        super('Game');
    }

    create() {
        this.world = generateWorld();
        this.fuel = this.FUEL_MAX;

        this.createWalls();
        this.createPlayer();
        this.addStartPlatform();
        this.addEndPlatform();
        this.addRefuelPlatformsForIntermediateNodes();
        this.setupCamera();
        this.createUI();
        this.setupControls();
        this.setupWorldBounds();
    }

    update(time: number, delta: number) {
        this.handlePlayerMovement(delta);
        this.handleRefuel(delta);
        this.updateFuelBar();
        this.updateSpeedText();
        this.updateCameraZoom();
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
        this.cameras.main.setBackgroundColor(0xffffaa);
        this.cameras.main.startFollow(this.player);
        this.scale.on('resize', this.handleResize, this);
    }

    private handleResize(gameSize: Phaser.Structs.Size): void {
        const { width, height } = gameSize;
        this.cameras.resize(width, height);
    }

    private createWalls(): void {
        this.wallGroup = this.physics.add.staticGroup();

        for (let y = 0; y < this.world.height; y++) {
            for (let x = 0; x < this.world.width; x++) {
                if (this.world.map[y][x] === WorldCell.WALL) {
                    const posX = x * this.tileSize + this.tileSize / 2;
                    const posY = y * this.tileSize + this.tileSize / 2;
                    const wall = this.add.rectangle(posX, posY, this.tileSize, this.tileSize, this.wallColor);
                    this.wallGroup.add(wall);
                }
            }
        }
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
            0x888888
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
            0x00ff00 // зелёная платформа для заправки
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
            0xff0000 // Можно заменить на this.playerColor если хочешь
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
        this.speedText = this.add.text(0, 0, '', {
            fontSize: '16px',
            color: '#000000',
            backgroundColor: '#ffffff',
        });
        this.speedText.setOrigin(0.5, 1);

        const barWidth = this.tileSize * this.playerSizeTiles * 1.5;
        const barHeight = 10;

        this.fuelBarBackground = this.add.rectangle(0, 0, barWidth, barHeight, 0x000000, 0.3);
        this.fuelBarForeground = this.add.rectangle(0, 0, barWidth, barHeight, 0x00ff00, 0.6);

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

        if (this.fuel <= 0) return;

        let dirX = 0;
        let dirY = 0;

        if (this.cursors.left?.isDown) dirX -= 1;
        if (this.cursors.right?.isDown) dirX += 1;
        if (this.cursors.up?.isDown) dirY -= 1;

        if (dirX !== 0) body.acceleration.x = dirX * 300;
        if (dirY !== 0) body.acceleration.y = dirY * 800;

        const directionCount = Math.abs(dirX) + Math.abs(dirY);
        if (directionCount > 0) {
            const multiplier = directionCount === 2 ? 1.5 : 1;
            this.fuel -= this.FUEL_CONSUMPTION_BASE * multiplier * dt;
            this.fuel = Math.max(this.fuel, 0);
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
}
