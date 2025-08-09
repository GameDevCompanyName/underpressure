import { Scene } from 'phaser';
import { generateWorld, WallBlock, World, WorldCell, WorldSegment } from '../../gen/common';
import { PathNode, PathNodeType } from '../../gen/path';
import SoundManager from '../../util/SoundManager';
import { HEIGHT_PIXELS, WIDTH_PIXELS } from '../../util/const';
import { getRandomWorldColors, WorldColors } from '../../util/worldColorGeneration';
import { fadeFromBlack, fadeToBlack } from '../../util/ui';

export class Game extends Scene {
    private DEBUG = false;

    private debugGraphics: Phaser.GameObjects.Graphics | null = null;

    private soundManager: SoundManager;

    private raycasterPlugin: PhaserRaycaster;
    private raycaster: Raycaster;
    private ray: Raycaster.Ray;
    private intersections: Phaser.Geom.Point[];
    private someGraphics: Phaser.GameObjects.Graphics;

    private VISION: number = 550;

    private tileSize = 10;
    private playerSizeTiles = 3.5;
    private worldColors: WorldColors;
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
    private visionGradient: Phaser.GameObjects.Image;

    private readonly FUEL_MAX = 200 + (this.DEBUG ? 2000 : 0);
    private readonly FUEL_CONSUMPTION_BASE = 10;
    private readonly REFUEL_RATE = 0.2;

    private isRefueling: boolean;
    private isThrusting: boolean;
    private winState: boolean;
    private loseState: boolean;

    private readonly MIN_ZOOM = this.DEBUG ? 0.3 : 0.5;
    private readonly MAX_ZOOM = this.DEBUG ? 0.3 : 0.45;
    private readonly MAX_SPEED = 600;

    private fuel: number;
    
    private lightRefreshDeltaSum = 0;

    private wallInstances: Map<number, Phaser.GameObjects.Rectangle>;
    private addedWallBlocks: Map<number, boolean>;
    private currentActiveSegment: WorldSegment;

    constructor() {
        super('Game');
    }

    shutdown() {
        // Удаляем текстуру
        if (this.textures.exists('visionGradient')) {
            this.textures.remove('visionGradient');
        }

        // Уничтожаем спрайт
        if (this.visionGradient) {
            this.visionGradient.destroy();
        }
    }

    preload() {
        this.soundManager = new SoundManager(this);
        this.soundManager.preloadGameSounds();
    }

    create() {
        this.winState = false;
        this.loseState = false;
        this.isRefueling = false;
        this.isThrusting = false;
        this.fuel = this.FUEL_MAX;

        this.soundManager.initGameInstances();
        this.soundManager.startCaveAmbience();
        this.soundManager.playMusic();

        this.world = generateWorld();
        this.addedWallBlocks = new Map();
        this.wallInstances = new Map();
        this.currentActiveSegment = this.world.startSegment;

        this.worldColors = getRandomWorldColors();


        if (this.DEBUG) {
            this.drawDebugSegmentBorders(this.world.segments);
        }

        this.wallGroup = this.physics.add.staticGroup();
        this.createWallBlocks();
        this.createPlayer();
        this.addStartPlatform();
        this.addEndPlatform();
        this.addRefuelPlatformsForIntermediateNodes();
        this.setupCamera();
        if (!this.DEBUG) {
            this.setupVisionGradient();
        }
        this.createUI();
        this.setupControls();
        this.setupWorldBounds();
        this.setupFadingText(1);
        this.setupShadows();

        fadeFromBlack(this, 1000);
    }

    private setupShadows() {
        this.raycaster = this.raycasterPlugin.createRaycaster();
        this.ray = this.raycaster.createRay({
            origin: {
                x: 0,
                y: 0
            },
            detectionRange: this.VISION
        });
        this.setupShadowCasting();
        //cast ray in all directions
        this.intersections = this.ray.castCircle();
        this.someGraphics = this.add.graphics({ lineStyle: { width: 1, color: 0x00ff00 }, fillStyle: { color: 0xffffff, alpha: 0.3 } });
        // this.someGraphics.setDepth(2);
    }

    private clearShadowCasting() {
        if (!this.DEBUG) {
            this.raycaster.removeMappedObjects(this.wallGroup.getChildren());
        }
    }

    private setupShadowCasting() {
        if (!this.DEBUG) {
            this.raycaster.mapGameObjects(this.wallGroup.getChildren());
        }
    }

    update(time: number, delta: number) {
        this.handlePlayerMovement(delta);
        this.handleRefuel(delta);
        this.handleSegmentLoadUnloading({ x: this.player.x / this.tileSize, y: this.player.y / this.tileSize })
        this.updateCameraZoom();

        if (this.lightRefreshDeltaSum > 30) {
            this.ray.setOrigin(this.player.x, this.player.y);
            this.intersections = this.ray.castCircle();
            this.redrawLight();
            this.lightRefreshDeltaSum = 0;
        } else {
            this.lightRefreshDeltaSum += delta;
        }

        this.updateFuelBar();
        if (!this.DEBUG) {
            this.visionGradient.setPosition(this.player.x, this.player.y);
        }
    }

    private setupVisionGradient() {
        if (this.textures.exists('visionGradient')) {
            this.textures.remove('visionGradient');
        }

        const x = this.player.x;
        const y = this.player.y;
        const radiusStart = this.VISION * 0.4;
        const radiusEnd = this.VISION;

        // Создаем текстуру для градиента
        const texture = this.textures.createCanvas('visionGradient', window.innerWidth, window.innerHeight)!;
        const ctx = texture.getContext();

        // Создаем радиальный градиент
        const gradient = ctx.createRadialGradient(
            window.innerWidth / 2, window.innerHeight / 2, radiusStart,  // Внутренний круг (начало градиента)
            window.innerWidth / 2, window.innerHeight / 2, radiusEnd     // Внешний круг (конец градиента)
        );

        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');      // Полностью прозрачный в центре
        gradient.addColorStop(1, `rgba(0, 0, 0, 1)`);    // Затемнение к краю

        // Рисуем градиент
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        texture.refresh();

        // Создаем спрайт с градиентом
        this.visionGradient = this.add.image(0, 0, 'visionGradient')
            .setDepth(1)
            .setPosition(x, y)
            .setOrigin(0.5, 0.5)
            .setBlendMode(Phaser.BlendModes.MULTIPLY);
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
        this.cameras.main.setBackgroundColor(this.worldColors.bgColor);
        this.cameras.main.startFollow(this.player);
        this.scale.on('resize', this.handleResize, this);
    }

    private handleResize(gameSize: Phaser.Structs.Size): void {
        const { width, height } = gameSize;
        this.cameras.resize(width, height);
    }

    private createWallBlocks(): void {
        this.addExtraWallsAround();
        // create 4 walls - one from -1000 to (width + 1000) and from 0 to 1000 height
        // i need this walls to fully surround map with walls, so that player does not see the empty world arround

        // Получаем все релевантные сегменты
        const relevantSegments = [
            this.world.startSegment,
            ...this.world.startSegment.neighbours
        ];

        // Добавляем стены из всех релевантных сегментов
        for (const segment of relevantSegments) {
            for (const block of segment.blocks) {
                this.addWallBlock(block);
            }
        }
    }

    private handleSegmentLoadUnloading(playerPosition: Point) {
        // 1. Проверяем, находится ли игрок в текущем активном сегменте
        if (this.isPointInSegment(playerPosition, this.currentActiveSegment)) {
            return; // Игрок остался в том же сегменте - ничего не делаем
        }

        this.clearShadowCasting();

        // 2. Ищем новый активный сегмент среди соседей
        const newActiveSegment = this.findSegmentForPoint(playerPosition, [
            this.currentActiveSegment,
            ...this.currentActiveSegment.neighbours
        ]);

        if (!newActiveSegment) {
            console.warn("Player moved to segment that is not adjacent to current active segment");
            return;
        }

        // 3. Определяем сегменты, которые нужно выгрузить (те, что не соседи нового активного сегмента)
        const segmentsToUnload = this.getSegmentsToUnload(newActiveSegment);

        // 4. Определяем сегменты, которые нужно загрузить (новые соседи)
        const segmentsToLoad = this.getSegmentsToLoad(newActiveSegment);

        // 5. Выгружаем ненужные сегменты
        for (const segment of segmentsToUnload) {
            this.unloadSegment(segment);
        }

        // 6. Загружаем новые сегменты
        for (const segment of segmentsToLoad) {
            this.loadSegment(segment);
        }

        // 7. Обновляем текущий активный сегмент
        this.currentActiveSegment = newActiveSegment;
        this.setupShadowCasting();
    }

    // Вспомогательные методы:

    private isPointInSegment(point: Point, segment: WorldSegment): boolean {
        return point.x >= segment.leftX &&
            point.x < segment.rightX &&
            point.y >= segment.topY &&
            point.y < segment.bottomY;
    }

    private findSegmentForPoint(point: Point, segments: WorldSegment[]): WorldSegment | null {
        for (const segment of segments) {
            if (this.isPointInSegment(point, segment)) {
                return segment;
            }
        }
        return null;
    }

    private getSegmentsToUnload(newActiveSegment: WorldSegment): WorldSegment[] {
        const currentNeighbors = new Set([
            this.currentActiveSegment,
            ...this.currentActiveSegment.neighbours
        ]);

        const newNeighbors = new Set([
            newActiveSegment,
            ...newActiveSegment.neighbours
        ]);

        // Находим сегменты, которые были загружены, но не должны быть
        return Array.from(currentNeighbors).filter(
            segment => !newNeighbors.has(segment)
        );
    }

    private getSegmentsToLoad(newActiveSegment: WorldSegment): WorldSegment[] {
        const currentNeighbors = new Set([
            this.currentActiveSegment,
            ...this.currentActiveSegment.neighbours
        ]);

        const newNeighbors = [
            newActiveSegment,
            ...newActiveSegment.neighbours
        ];

        // Находим сегменты, которые нужно загрузить (еще не загружены)
        return newNeighbors.filter(
            segment => !currentNeighbors.has(segment)
        );
    }

    private unloadSegment(segment: WorldSegment): void {
        console.log(`Unloading segment ${segment.id}`);

        for (const block of segment.blocks) {
            if (!this.isBlockUsedInOtherSegments(block, segment)) {
                this.removeWallBlock(block);
            }
        }
    }

    private loadSegment(segment: WorldSegment): void {
        console.log("loaded segment: " + segment.id);
        for (const block of segment.blocks) {
            this.addWallBlock(block);
        }
    }

    private isBlockUsedInOtherSegments(block: WallBlock, excludeSegment: WorldSegment): boolean {
        const loadedSegments = [
            this.currentActiveSegment,
            ...this.currentActiveSegment.neighbours
        ].filter(s => s.id !== excludeSegment.id);

        return loadedSegments.some(segment =>
            segment.blocks.some(b => b.id === block.id)
        );
    }

    /**
    * Добавляет стену в мир, если она еще не была добавлена
    * @param block - блок стены для добавления
    */
    private addWallBlock(block: WallBlock): void {
        // Проверяем, не добавлена ли уже эта стена
        if (this.addedWallBlocks.has(block.id)) {
            return;
        }

        // Вычисляем параметры стены
        const widthCoords = block.rightBottom.x - block.leftTop.x;
        const widthPixels = (widthCoords + 1) * this.tileSize;
        const heightCoords = block.rightBottom.y - block.leftTop.y;
        const heightPixels = (heightCoords + 1) * this.tileSize;

        const xCenter = (block.rightBottom.x + block.leftTop.x) / 2;
        const yCenter = (block.rightBottom.y + block.leftTop.y) / 2;

        const posX = xCenter * this.tileSize + this.tileSize / 2;
        const posY = yCenter * this.tileSize + this.tileSize / 2;

        // Создаем графический объект стены
        const wall = this.add.rectangle(
            posX,
            posY,
            widthPixels,
            heightPixels,
            this.worldColors.wallColor
        );

        // Добавляем стену в группу и сохраняем ссылку
        this.wallGroup.add(wall);
        this.wallInstances.set(block.id, wall);
        this.addedWallBlocks.set(block.id, true);
    }

    /**
     * Удаляет стену из мира
     * @param block - блок стены для удаления
     */
    private removeWallBlock(block: WallBlock): void {
        // Проверяем, существует ли стена
        if (!this.addedWallBlocks.has(block.id)) {
            return;
        }

        // Получаем экземпляр стены
        const wallInstance = this.wallInstances.get(block.id);
        if (wallInstance) {
            this.wallGroup.remove(wallInstance);
            // Удаляем графический объект
            wallInstance.destroy();

            // Удаляем из коллекций
            this.wallInstances.delete(block.id);
            this.addedWallBlocks.delete(block.id);
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
            this.worldColors.wallColor
        );
        this.wallGroup.add(topWall);

        // Нижняя стена
        const bottomWall = this.add.rectangle(
            mapPixelWidth / 2,
            mapPixelHeight + extraSize / 2, // ниже карты
            mapPixelWidth + extraSize * 2,
            extraSize,
            this.worldColors.wallColor
        );
        this.wallGroup.add(bottomWall);

        // Левая стена
        const leftWall = this.add.rectangle(
            -extraSize / 2, // левее карты
            mapPixelHeight / 2,
            extraSize,
            mapPixelHeight + extraSize * 2,
            this.worldColors.wallColor
        );
        this.wallGroup.add(leftWall);

        // Правая стена
        const rightWall = this.add.rectangle(
            mapPixelWidth + extraSize / 2, // правее карты
            mapPixelHeight / 2,
            extraSize,
            mapPixelHeight + extraSize * 2,
            this.worldColors.wallColor
        );
        this.wallGroup.add(rightWall);
    }

    private addStartPlatform(): void {
        const startNode = this.world.pathInfo.nodes[0];
        this.addPlatformAtNode(startNode, this.endPlatformColor);
    }

    private addEndPlatform(): void {
        const endNode = this.world.pathInfo.nodes[this.world.pathInfo.nodes.length - 1];
        this.addPlatformAtNode(endNode, this.endPlatformColor, () => {
            if (!this.winState && !this.loseState) {
                this.winState = true;
                this.soundManager.stopSoundsAndPlayWin();
                fadeToBlack(this, 1000, () => {
                    this.scene.start("MainMenu");
                    this.scene.stop("Game");
                });
            }
        });
    }

    private addPlatformAtNode(node: PathNode, color: number, collisionHandler?: () => void): void {
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
        this.physics.add.collider(this.player, platform, collisionHandler);
    }

    private addRefuelPlatformsForIntermediateNodes(): void {
        const nodes = this.world.pathInfo.nodes;
        for (let i = 1; i < nodes.length - 1; i++) {
            if (nodes[i].type === PathNodeType.REFUEL) {
                this.addPlatformAtNode(nodes[i], this.platformColor, () => {
                    if (!this.isRefueling) {
                        this.isRefueling = true;
                    }
                });
            }
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
            if (!this.winState && !this.loseState && !this.DEBUG) {
                this.loseState = true;
                this.soundManager.stopSoundsAndPlayDeath();
                fadeToBlack(this, 1000, () => {
                    this.scene.start("MainMenu");
                    this.scene.stop("Game");
                });
            }
        });
    }

    private drawDebugSegmentBorders(segments: WorldSegment[]): void {
        if (!this.debugGraphics) {
            this.debugGraphics = this.add.graphics();
            this.debugGraphics.depth = 1000;
        }

        this.debugGraphics.clear();

        // Ярко-красный цвет с полной непрозрачностью
        this.debugGraphics.lineStyle(8, 0xffFFFF, 1.0);

        for (const segment of segments) {
            const left = segment.leftX * this.tileSize;
            const right = segment.rightX * this.tileSize;
            const top = segment.topY * this.tileSize;
            const bottom = segment.bottomY * this.tileSize;

            // Рисуем прямоугольник (все 4 стороны)
            this.debugGraphics.strokeRect(left, top, right - left, bottom - top);
        }
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

        if (this.fuel <= 0 || this.loseState || this.winState) {
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
        titleTextObject.setDepth(2);

        const musicText = "Destructo20 - " + this.soundManager.getTrackName();
        const musicTextObject: Phaser.GameObjects.Text = this.add.text(
            this.player.x - WIDTH_PIXELS / 2,
            this.player.y + HEIGHT_PIXELS - 50,
            musicText,
            { fontFamily: 'Courier New', fontSize: 26 }
        );
        musicTextObject.setDepth(2);

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
