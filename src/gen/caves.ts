import { WorldCell, Map, generateFilledMap, applyRuleToAllButEdges } from "./common";

export function createRandomFiller(p: number): () => WorldCell {
    return () => Math.random() > p ? WorldCell.EMPTY : WorldCell.WALL;
}

// принимает массив 3х3 - в центре целевая клетка, вокруг соседи
export function countNeighbours(array: WorldCell[][]): number {
    let count = 0;
    for (let y = 0; y <= 2; y++) {
        for (let x = 0; x <= 2; x++) {
            if (x === 1 && y === 1) {
                continue;
            }
            if (array[x][y] === WorldCell.WALL) {
                count++;
            }
        }
    }
    return count;
}

export function createSmoothingRule(neighbourCount: number): (array: Map) => WorldCell {
    return (array: Map) => {
        if (countNeighbours(array) >= neighbourCount) {
            return WorldCell.WALL;
        } else {
            return WorldCell.EMPTY;
        }
    };
}

export function generateWithNoiseCaves(
    height: number,
    width: number
): Map {
    let map: Map = generateFilledMap(height, width);

    map = applyRuleToAllButEdges(map, createRandomFiller(0.39));
    map = smoothIterations(map, 4, 2);

    return map;
}

export function smoothIterations(map: Map, neighbours: number, iterations: number): Map {
    let newMap = map;
    const smoothingRule = createSmoothingRule(neighbours);
    for (let i = 0; i < iterations; i++) {
        newMap = applyRuleToAllButEdges(newMap, (point, neigh) => smoothingRule(neigh));
    }
    return newMap;
}

