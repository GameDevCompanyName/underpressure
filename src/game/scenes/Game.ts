import { Scene } from 'phaser';
import { generateWorld, World, WorldCell } from '../../gen/common';

export class Game extends Scene {
    raycasterPlugin: PhaserRaycaster;

    // Переменные уровня
    private tileSize = 10;
    private playerSizeTiles = 3.5;
    private wallColor = 0x8b4513; // SaddleBrown
    private wallGroup: Phaser.Physics.Arcade.StaticGroup;
    private world: World;

    private cursors: Partial<Phaser.Types.Input.Keyboard.CursorKeys>;

    private player: Phaser.GameObjects.Rectangle;
    private speedText: Phaser.GameObjects.Text;
    private fuelBarBackground: Phaser.GameObjects.Rectangle;
    private fuelBarForeground: Phaser.GameObjects.Rectangle;

    private readonly FUEL_MAX = 100;
    private readonly FUEL_CONSUMPTION_BASE = 10; // единиц в секунду

    // Определяем масштаб в зависимости от скорости
    private readonly MIN_ZOOM = 0.2;    // При низкой скорости
    private readonly MAX_ZOOM = 0.2;    // При высокой скорости
    private readonly MAX_SPEED = 600;   // Ожидаемая максимальная скорость (подбери под свою игру)
    private fuel: number;

    constructor() {
        super('Game');
    }

    create() {
        this.world = generateWorld();
        this.fuel = this.FUEL_MAX;

        // 1. Устанавливаем жёлтый фон
        this.cameras.main.setBackgroundColor(0xffffaa);

        // 3. Отрисовываем стенки как коричневые квадраты (Graphics)
        // Проходим по карте, рисуем rect для каждой клетки == 1

        // Проходим по всей карте
        // Добавляем группу или массив объектов стен с физикой
        // Добавляем тела для столкновений
        // Группа для хранения всех физических стен
        this.wallGroup = this.physics.add.staticGroup();

        for (let y = 0; y < this.world.height; y++) {
            for (let x = 0; x < this.world.width; x++) {
                if (this.world.map[y][x] === WorldCell.WALL) {
                    const posX = x * this.tileSize + this.tileSize / 2;
                    const posY = y * this.tileSize + this.tileSize / 2;

                    const wall = this.add.rectangle(posX, posY, this.tileSize, this.tileSize, this.wallColor);
                    wall.setPipeline('Light2D');
                    this.wallGroup.add(wall);
                }
            }
        }

        // 5. Создаём игрока в нужной точке (красный квадрат)
        // Добавляем физику

        // Стартовая позиция игрока (например, в начале туннеля)
        const startX = this.tileSize * 9 + this.tileSize / 2;
        const startY = this.world.height * this.tileSize / 2;

        // Создаём визуальный объект — красный прямоугольник
        this.player = this.add.rectangle(startX, startY, this.tileSize * this.playerSizeTiles, this.tileSize * this.playerSizeTiles, 0xff0000);

        // Добавляем физику вручную
        this.physics.add.existing(this.player);

        // Получаем доступ к телу
        const body = this.player.body as Phaser.Physics.Arcade.Body;

        body.setCollideWorldBounds(true);
        body.setBounce(0);
        body.setDrag(50); // необязательно: немного торможения
        body.setMaxVelocity(this.MAX_SPEED); // ограничение скорости
        body.setAllowGravity(true); //TODO

        // Настраиваем столкновение с группой стен
        this.physics.add.collider(this.player, this.wallGroup, () => {
            // При столкновении — перезапуск сцены
            // this.scene.restart(); //TODO
        });

        // создаем текст для отображения скорости
        this.speedText = this.add.text(0, 0, '', {
            fontSize: '16px',
            color: '#000000',
            backgroundColor: '#ffffff',
        });
        this.speedText.setOrigin(0.5, 1); // центрируем по X, снизу по Y (чтобы текст был над объектом)

        //fuelbar
        const barWidth = this.tileSize * 1.5;
        const barHeight = 10;

        this.fuelBarBackground = this.add.rectangle(0, 0, barWidth, barHeight, 0x000000, 0.3);
        this.fuelBarForeground = this.add.rectangle(0, 0, barWidth, barHeight, 0x00ff00, 0.6);

        // Центрируем по origin
        this.fuelBarBackground.setOrigin(0.5, 0);
        this.fuelBarForeground.setOrigin(0.5, 0);

        // 6. Настраиваем камеру и границы мира
        // Камера следует за игроком, мир ограничен размером карты

        // 7. Настраиваем клавиши (W, A, D)

        // Управление
        this.cursors = this.input.keyboard!.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            up: Phaser.Input.Keyboard.KeyCodes.W
        });

        // Камера следует за кораблём
        this.cameras.main.startFollow(this.player);
        this.scale.on('resize', this.handleResize, this);

        const worldWidth = this.tileSize * this.world.width;
        const worldHeight = this.tileSize * this.world.height;

        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    }

    private handleResize(gameSize: Phaser.Structs.Size): void {
        const width = gameSize.width;
        const height = gameSize.height;

        this.cameras.resize(width, height);
    }

    update(time: number, delta: number) {
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        const dt = delta / 1000;

        // Сброс ускорения каждый кадр
        body.acceleration.set(0);

        // Подсчёт направления, если есть топливо
        if (this.fuel > 0) {
            let dirX = 0;
            let dirY = 0;

            // Обработка нажатий
            if (this.cursors.left!.isDown) dirX -= 1;
            if (this.cursors.right!.isDown) dirX += 1;
            if (this.cursors.up!.isDown) dirY -= 1;

            // Применяем ускорение
            if (dirX !== 0) body.acceleration.x = dirX * 300;
            if (dirY !== 0) body.acceleration.y = dirY * 800;

            // Если есть движение — считаем расход топлива
            const directionCount = Math.abs(dirX) + Math.abs(dirY);
            if (directionCount > 0) {
                const fuelMultiplier = directionCount === 2 ? 1.5 : 1;
                this.fuel -= this.FUEL_CONSUMPTION_BASE * fuelMultiplier * dt;
                this.fuel = Math.max(this.fuel, 0); // Не уходим в минус
            }
        }

        const barWidth = this.tileSize * 1.5;

        // Позиция под ракетой
        const barX = this.player.x;
        const barY = this.player.y + this.tileSize / 2 + 4; // чуть ниже ракеты

        this.fuelBarBackground.setPosition(barX, barY);

        // Расчёт ширины переднего бара (по топливу)
        const fuelRatio = Phaser.Math.Clamp(this.fuel / this.FUEL_MAX, 0, 1);
        this.fuelBarForeground.setPosition(barX, barY);
        this.fuelBarForeground.width = barWidth * fuelRatio;

        // Обновляем позицию текста скорости над игроком
        this.speedText.setPosition(this.player.x, this.player.y - this.tileSize / 2 - 8);

        // Показываем округлённую скорость
        const vx = body.velocity.x.toFixed(0);
        const vy = body.velocity.y.toFixed(0);
        this.speedText.setText(`vx: ${vx}\nvy: ${vy}`);

        // Получаем скорость игрока
        const velocityX = body.velocity.x;

        // Интерполируем зум (плавное уменьшение масштаба при росте скорости)
        const t = Phaser.Math.Clamp(velocityX / this.MAX_SPEED, 0, 1);
        const zoom = Phaser.Math.Linear(this.MIN_ZOOM, this.MAX_ZOOM, t);

        // Применяем масштаб
        this.cameras.main.setZoom(zoom);
    }
}
