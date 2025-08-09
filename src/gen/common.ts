import { createRandomFiller, createSmoothingRule, generateWithNoiseCaves, smoothIterations } from "./caves";
import { clearEdgesCells, clearNodeCells, generatePathInfo, WorldPathInfo } from "./path";
import { clearUnreachableWalls, deepCopyArray, fillFakeWalls, getOptimisedWallBlocks, refineWallBlocks } from "./util";

export enum WorldCell {
    WALL,
    EMPTY
}

export type WorldMap = WorldCell[][];

export interface World {
    height: number;
    width: number;
    map: WorldMap;
    pathInfo: WorldPathInfo;
    optimisedWallBlocks: WallBlock[];
}

export interface Point {
    x: number;
    y: number;
}

export type Polygon = Point[];

export interface WallBlock {
    leftTop: Point;
    rightBottom: Point;
}

export function generateWorld(): World {
    const height: number = 400;
    const width: number = 600;

    // let map = generateFilledMap(height, width);

    // map = clearSinPath(
    //     map,
    //     height,
    //     width,
    //     10,
    //     10,
    //     25,
    //     20,
    //     0.5
    // );

    let map = generateWithNoiseCaves(
        height,
        width
    );
    const pathInfo = generatePathInfo(map);
    map = clearNodeCells(map, pathInfo);
    map = clearEdgesCells(map, pathInfo);
    map = smoothIterations(map, 4, 8);
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

    return {
        height,
        width,
        map,
        pathInfo,
        optimisedWallBlocks: refinedWalls
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
