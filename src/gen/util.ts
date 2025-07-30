import { Map, WorldCell } from "./common";

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

export function clearUnreachableWalls(map: Map, start: Point): Map {
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
    const newMap: Map = map.map((row, y) =>
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
