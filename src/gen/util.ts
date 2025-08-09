import { getNextUniqueId } from "../util/common";
import { WorldMap, Polygon, WallBlock, WorldCell } from "./common";

export function distance(from: Point, to: Point) {
    const { x: x1, y: y1 } = from;
    const { x: x2, y: y2 } = to;
    const y = x2 - x1;
    const x = y2 - y1;
    return Math.sqrt(x * x + y * y);
}

export function deepCopyArray<T>(array: T[][]): T[][] {
    let newArray = [];
    for (let i = 0; i < array.length; i++) {
        newArray[i] = array[i].slice();
    }
    return newArray;
}

export function randomInRange(from: number, to: number): number {
    return from + Math.random() * (to - from);
}

export function clearUnreachableWalls(map: WorldMap, start: Point): WorldMap {
    const height = map.length;
    const width = map[0].length;

    const visited: boolean[][] = Array.from({ length: height }, () =>
        Array(width).fill(false)
    );

    const queue: Point[] = [];
    queue.push(start);
    visited[start.y][start.x] = true;

    const directions = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
    ];

    while (queue.length > 0) {
        const current = queue.shift()!;
        for (const dir of directions) {
            const nx = current.x + dir.x;
            const ny = current.y + dir.y;

            if (
                nx >= 0 && nx < width &&
                ny >= 0 && ny < height &&
                !visited[ny][nx] &&
                map[ny][nx] === WorldCell.EMPTY
            ) {
                visited[ny][nx] = true;
                queue.push({ x: nx, y: ny });
            }
        }
    }

    // Создаем новую карту
    const newMap: WorldMap = map.map((row, y) =>
        row.map((cell, x) => {
            if (cell === WorldCell.EMPTY && visited[y][x]) {
                return WorldCell.EMPTY;
            }

            // Если это стена, проверяем достижимость по соседям
            if (cell === WorldCell.WALL) {
                // Проверим, достижима ли хотя бы одна соседняя клетка
                for (const dir of directions) {
                    const nx = x + dir.x;
                    const ny = y + dir.y;
                    if (
                        nx >= 0 && nx < width &&
                        ny >= 0 && ny < height &&
                        visited[ny][nx]
                    ) {
                        return WorldCell.WALL; // Оставляем стену
                    }
                }
                return WorldCell.EMPTY; // Удаляем недостижимую стену
            }

            return WorldCell.EMPTY; // По умолчанию — безопасно
        })
    );

    return newMap;
}

export function fillFakeWalls(map: WorldMap): WorldMap {
    const height = map.length;
    const width = map[0].length;

    const copy = deepCopyArray(map);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
                copy[y][x] = WorldCell.WALL;
            }
            if (y === 1 || y === height - 2 || x === 1 || x === width - 2) {
                copy[y][x] = WorldCell.WALL;
            }
        }
    }

    return copy;
}

export function getOptimisedWallBlocks(map: WorldMap): WallBlock[] {
    const height = map.length;
    const width = map[0].length;

    const visited: boolean[][] = Array.from({ length: height }, () =>
        Array(width).fill(false)
    );

    const blocks: WallBlock[] = [];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (map[y][x] !== WorldCell.WALL || visited[y][x]) {
                continue;
            }

            // Определим максимальную ширину
            let maxWidth = 0;
            for (let xx = x; xx < width && map[y][xx] === WorldCell.WALL && !visited[y][xx]; xx++) {
                maxWidth++;
            }

            // Определим максимальную высоту, соблюдая ширину
            let maxHeight = 0;
            let done = false;
            for (let yy = y; yy < height && !done; yy++) {
                for (let xx = x; xx < x + maxWidth; xx++) {
                    if (map[yy][xx] !== WorldCell.WALL || visited[yy][xx]) {
                        done = true;
                        break;
                    }
                }
                if (!done) {
                    maxHeight++;
                }
            }

            // Отметим все клетки внутри прямоугольника как посещенные
            for (let yy = y; yy < y + maxHeight; yy++) {
                for (let xx = x; xx < x + maxWidth; xx++) {
                    visited[yy][xx] = true;
                }
            }

            // Добавим прямоугольник в результат
            blocks.push({
                id: getNextUniqueId(),
                leftTop: { x, y },
                rightBottom: { x: x + maxWidth - 1, y: y + maxHeight - 1 },
            });
        }
    }

    return blocks;
}

export function refineWallBlocks(blocks: WallBlock[]): WallBlock[] {
    // 1) Убираем 1×1 блоки
    let filtered = blocks.filter(b => {
        const w = b.rightBottom.x - b.leftTop.x + 1;
        const h = b.rightBottom.y - b.leftTop.y + 1;
        return !(w === 1 && h === 1);
    });

    // 2) Попытка слияния соседних блоков
    let merged = true;
    while (merged) {
        merged = false;
        const result: WallBlock[] = [];
        const used = new Array(filtered.length).fill(false);

        for (let i = 0; i < filtered.length; i++) {
            if (used[i]) continue;
            const a = filtered[i];

            let didMerge = false;
            for (let j = i + 1; j < filtered.length; j++) {
                if (used[j]) continue;
                const b = filtered[j];

                // Горизонтальное слияние: одинаковая Y, и один справа от другого
                if (
                    a.leftTop.y === b.leftTop.y &&
                    a.rightBottom.y === b.rightBottom.y &&
                    (a.rightBottom.x + 1 === b.leftTop.x || b.rightBottom.x + 1 === a.leftTop.x)
                ) {
                    // Новый объединённый блок по X-оси
                    const leftX = Math.min(a.leftTop.x, b.leftTop.x);
                    const rightX = Math.max(a.rightBottom.x, b.rightBottom.x);
                    const mergedBlock: WallBlock = {
                        id: getNextUniqueId(),
                        leftTop: { x: leftX, y: a.leftTop.y },
                        rightBottom: { x: rightX, y: a.rightBottom.y },
                    };
                    result.push(mergedBlock);
                    used[i] = used[j] = true;
                    merged = didMerge = true;
                    break;
                }

                // Вертикальное слияние: одинаковая X, и один над другим
                if (
                    a.leftTop.x === b.leftTop.x &&
                    a.rightBottom.x === b.rightBottom.x &&
                    (a.rightBottom.y + 1 === b.leftTop.y || b.rightBottom.y + 1 === a.leftTop.y)
                ) {
                    // Новый объединённый блок по Y-оси
                    const topY = Math.min(a.leftTop.y, b.leftTop.y);
                    const bottomY = Math.max(a.rightBottom.y, b.rightBottom.y);
                    const mergedBlock: WallBlock = {
                        id: getNextUniqueId(),
                        leftTop: { x: a.leftTop.x, y: topY },
                        rightBottom: { x: a.rightBottom.x, y: bottomY },
                    };
                    result.push(mergedBlock);
                    used[i] = used[j] = true;
                    merged = didMerge = true;
                    break;
                }
            }

            // Если i не слился ни с кем — оставляем его как есть
            if (!didMerge && !used[i]) {
                result.push(a);
                used[i] = true;
            }
        }

        // Готово, переходим на следующий раунд проверки, если что-то слили
        filtered = result;
    }

    return filtered;
}
