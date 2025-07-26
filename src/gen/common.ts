import { createRandomFiller, createSmoothingRule, generateWithNoiseCaves, smoothIterations } from "./caves";
import { clearEdgesCells, clearNodeCells, generatePathInfo } from "./path";
import { deepCopyArray } from "./util";

export enum WorldCell {
    WALL,
    EMPTY,
    START,
    END
}

export type Map = WorldCell[][];

export interface World {
    height: number;
    width: number;
    map: Map;
}

export interface Point {
    x: number;
    y: number;
}

export function generateWorld(): World {
    const height: number = 200;
    const width: number = 300;

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
    map = smoothIterations(map, 4, 6);

    return {
        height,
        width,
        map
    };
}

export function generateFilledMap(
    height: number,
    width: number
): Map {
    let map: Map = [];

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
    map: Map,
    height: number,
    width: number,
    padding_x: number,
    padding_y: number,
    freq: number,
    tunnelHeight: number,
    ampModifier: number
): Map {
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
    map: Map,
    rule: (point: Point, neighbours: Map) => WorldCell
): Map {
    const height = map.length;
    const width = map[0].length;
    return applyRuleToCoords(map, 1, width - 1, 1, height - 1, rule);
}

export function applyRuleToCoords(
    map: Map,
    fromX: number,
    toX: number,
    fromY: number,
    toY: number,
    rule: (point: Point, neighbours: Map) => WorldCell
): Map {
    let newMap: Map = deepCopyArray(map);

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
