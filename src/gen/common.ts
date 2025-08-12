import { getNextUniqueId } from "../util/common";
import { createRandomFiller, createSmoothingRule, generateWithNoiseCaves, smoothIterations } from "./caves";
import { WORLD_SEGMENT_SIZE } from "./const";
import { clearEdgesCells, clearNodeCells, generatePathInfo, WorldPathInfo } from "./path";
import { clearUnreachableWalls, deepCopyArray, fillFakeWalls, getOptimisedWallBlocks, refineWallBlocks } from "./util";

export enum WorldCell {
    WALL,
    EMPTY
}

export interface WorldSegment {
    id: number;
    leftX: number;
    rightX: number;
    topY: number;
    bottomY: number;
    blocks: WallBlock[];
    neighbours: WorldSegment[];
}

export type WorldMap = WorldCell[][];

export interface World {
    height: number;
    width: number;
    map: WorldMap;
    pathInfo: WorldPathInfo;
    optimisedWallBlocks: WallBlock[];
    segments: WorldSegment[];
    startSegment: WorldSegment;
}

export interface Point {
    x: number;
    y: number;
}

export type Polygon = Point[];

export interface WallBlock {
    id: number;
    leftTop: Point;
    rightBottom: Point;
}

export function generateWorld(width: number, height: number, difficulty: number): World {
    let map = generateWithNoiseCaves(
        height,
        width
    );
    map = smoothIterations(map, 4, 15);
    const pathInfo = generatePathInfo(map);
    map = clearNodeCells(map, pathInfo);
    map = clearEdgesCells(map, pathInfo);
    map = smoothIterations(map, 4, 6);
    // map = fillFakeWalls(map);

    let countWalls = 0;
    map.forEach((row: WorldCell[]) => {
        row.forEach((cell: WorldCell) => {
            if (cell === WorldCell.WALL) {
                countWalls++;
            }
        });
    })

    const optimisedWallBlocks = getOptimisedWallBlocks(map);
    console.log("original walls : " + countWalls);
    console.log("optimised walls : " + optimisedWallBlocks.length);
    const refinedWalls = refineWallBlocks(optimisedWallBlocks);
    console.log("refined walls : " + optimisedWallBlocks.length);

    let segments: WorldSegment[] = divideBlocksInSegments(width, height, optimisedWallBlocks, WORLD_SEGMENT_SIZE);
    let startSegment: WorldSegment = getStartSegment(segments, pathInfo.nodes[0].coords);

    return {
        height,
        width,
        map,
        pathInfo,
        optimisedWallBlocks: refinedWalls,
        segments,
        startSegment
    };
}

export function generateFilledMap(
    height: number,
    width: number
): WorldMap {
    let map: WorldMap = [];

    for (let y = 0; y < height; y++) {
        const row: WorldCell[] = [];
        for (let x = 0; x < width; x++) {
            // Если по краю — это стена
            row.push(WorldCell.WALL);
        }

        map.push(row);
    }

    return map;
}

export function clearSinPath(
    map: WorldMap,
    height: number,
    width: number,
    padding_x: number,
    padding_y: number,
    freq: number,
    tunnelHeight: number,
    ampModifier: number
): WorldMap {
    return applyRuleToAllButEdges(
        map,
        (point) => {
            const funVal = pathSin(point.x, height, padding_x, padding_y, freq, ampModifier);
            if (Math.abs(funVal - point.y) <= tunnelHeight / 2) {
                return WorldCell.EMPTY;
            } else {
                return map[point.y][point.x];
            }
        }
    );
}

export function applyRuleToAllButEdges(
    map: WorldMap,
    rule: (point: Point, neighbours: WorldMap) => WorldCell
): WorldMap {
    const height = map.length;
    const width = map[0].length;
    return applyRuleToCoords(map, 1, width - 1, 1, height - 1, rule);
}

export function applyRuleToCoords(
    map: WorldMap,
    fromX: number,
    toX: number,
    fromY: number,
    toY: number,
    rule: (point: Point, neighbours: WorldMap) => WorldCell
): WorldMap {
    let newMap: WorldMap = deepCopyArray(map);

    for (let y = fromY; y < toY; y++) {
        for (let x = fromX; x < toX; x++) {
            newMap[y][x] = rule(
                { x, y },
                [
                    [map[y - 1][x - 1], map[y - 1][x], map[y - 1][x + 1]],
                    [map[y][x - 1], map[y][x], map[y][x + 1]],
                    [map[y + 1][x - 1], map[y + 1][x], map[y + 1][x + 1]]
                ]
            );
        }
    }

    return newMap;
}

export function pathSin(
    x: number,
    height: number,
    padding_x: number,
    padding_y: number,
    freq: number,
    ampModifier: number
): number {
    const amp = (height - padding_y) / 2 * ampModifier;
    return Math.sin(
        (x - padding_x) / freq
    ) * amp + height / 2;
}

function divideBlocksInSegments(
    width: number,
    height: number,
    optimisedWallBlocks: WallBlock[],
    segmentSize: number
): WorldSegment[] {
    // Вычисляем количество сегментов
    const segmentsX = Math.ceil(width / segmentSize);
    const segmentsY = Math.ceil(height / segmentSize);

    // Создаем матрицу сегментов
    const segmentMatrix: WorldSegment[][] = Array(segmentsY)
        .fill(null)
        .map(() => Array(segmentsX).fill(null));

    // Инициализация сегментов
    for (let y = 0; y < segmentsY; y++) {
        for (let x = 0; x < segmentsX; x++) {
            segmentMatrix[y][x] = {
                id: getNextUniqueId(),
                leftX: x * segmentSize,
                rightX: Math.min((x + 1) * segmentSize, width),
                topY: y * segmentSize,
                bottomY: Math.min((y + 1) * segmentSize, height),
                blocks: [],
                neighbours: []
            };
        }
    }

    // Распределение блоков по сегментам
    for (const block of optimisedWallBlocks) {
        // Определяем границы блока
        const blockLeft = block.leftTop.x;
        const blockRight = block.rightBottom.x;
        const blockTop = block.leftTop.y;
        const blockBottom = block.rightBottom.y;

        // Находим индексы сегментов, которые пересекает блок
        const firstSegX = Math.floor(blockLeft / segmentSize);
        const lastSegX = Math.floor((blockRight) / segmentSize);
        const firstSegY = Math.floor(blockTop / segmentSize);
        const lastSegY = Math.floor((blockBottom) / segmentSize);

        // Добавляем блок во все пересекаемые сегменты
        for (let y = firstSegY; y <= lastSegY; y++) {
            for (let x = firstSegX; x <= lastSegX; x++) {
                if (y >= 0 && y < segmentsY && x >= 0 && x < segmentsX) {
                    segmentMatrix[y][x].blocks.push(block);
                }
            }
        }
    }

    // Находим соседей для каждого сегмента
    for (let y = 0; y < segmentsY; y++) {
        for (let x = 0; x < segmentsX; x++) {
            const current = segmentMatrix[y][x];

            // Проверяем все 8 направлений
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;

                    const nx = x + dx;
                    const ny = y + dy;

                    if (nx >= 0 && nx < segmentsX && ny >= 0 && ny < segmentsY) {
                        current.neighbours.push(segmentMatrix[ny][nx]);
                    }
                }
            }
        }
    }

    // Преобразуем матрицу в плоский массив
    return segmentMatrix.flat();
}

export function getStartSegment(segments: WorldSegment[], startPoint: Point): WorldSegment {
    for (const segment of segments) {
        if (startPoint.x >= segment.leftX &&
            startPoint.x < segment.rightX &&
            startPoint.y >= segment.topY &&
            startPoint.y < segment.bottomY) {
            return segment;
        }
    }

    throw new Error("Start point is not inside any segment");
}
