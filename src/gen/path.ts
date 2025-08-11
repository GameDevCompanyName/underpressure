import { applyRuleToAllButEdges, applyRuleToCoords, WorldMap, World, WorldCell } from "./common";
import { AVERAGE_NODE_DIAMETER, AVERAGE_NODE_DISTANCE, FUEL_DISTANCE, MAX_EDGE_AMP, MAX_EDGE_FREQ, MAX_EDGE_WIDTH, MIN_EDGE_AMP, MIN_EDGE_FREQ, MIN_EDGE_WIDTH, PATH_WIDTH_DEVIATION, REFUEL_PLATRORM_BASE_P, WORLD_PADDING } from "./const";
import { distance, randomInRange } from "./util";

export interface PathNode {
    coords: Point;
    type: PathNodeType;
    diameter: number;
}

export enum PathNodeType {
    START, END, EMPTY, REFUEL
}

export interface PathEdge {
    start: PathNode;
    end: PathNode;
    widthModifier: number;
    freqModifier: number;
    amplModifier: number;
}

export interface WorldPathInfo {
    nodes: PathNode[];
    edges: PathEdge[];
}

export function generatePathInfo(map: WorldMap): WorldPathInfo {
    const nodes: PathNode[] = [];
    const edges: PathEdge[] = [];
    const height = map.length;
    const width = map[0].length;

    const innerWidth = width - WORLD_PADDING * 2;
    const innerHeight = height - WORLD_PADDING * 2
    const count = Math.floor(innerWidth / AVERAGE_NODE_DISTANCE);
    const distanceX = Math.floor(innerWidth / count);

    //TODO
    let prevNode: PathNode | null = null;
    let refuelProbability = REFUEL_PLATRORM_BASE_P;

    for (let i = 0; i < count; i++) {
        const currentX = Math.floor(WORLD_PADDING + distanceX * i + distanceX / 2);
        const currentY = Math.floor(WORLD_PADDING + innerHeight * Math.random());

        let type: PathNodeType;
        switch (i) {
            case 0: type = PathNodeType.START; break;
            case count - 1: type = PathNodeType.END; break;
            default: {
                let dist = distance({x: currentX, y: currentY}, prevNode!.coords);
                if (dist > FUEL_DISTANCE / 2) {
                    let closenessToLimit = dist / FUEL_DISTANCE;
                    refuelProbability = (refuelProbability + closenessToLimit) / 2;
                    refuelProbability = Math.min(refuelProbability, 1);
                }
                if (Math.random() < refuelProbability) {
                    type = PathNodeType.REFUEL;
                    refuelProbability = REFUEL_PLATRORM_BASE_P;
                } else {
                    type = PathNodeType.EMPTY;
                    refuelProbability = (1 + refuelProbability) / 2;
                }
            }
        }

        const currentNode: PathNode = {
            coords: { x: currentX, y: currentY },
            type,
            diameter: AVERAGE_NODE_DIAMETER * (Math.random() + 0.5)
        }
        nodes.push(currentNode);

        if (i > 0) {
            const edge: PathEdge = {
                start: prevNode!!,
                end: currentNode,
                widthModifier: randomInRange(MIN_EDGE_WIDTH, MAX_EDGE_WIDTH),
                freqModifier: randomInRange(MIN_EDGE_FREQ, MAX_EDGE_FREQ),
                amplModifier: randomInRange(MIN_EDGE_AMP, MAX_EDGE_AMP)
            }
            edges.push(edge);
        }

        prevNode = currentNode;
    }

    return {
        nodes,
        edges
    };
}

export function clearNodeCells(map: WorldMap, info: WorldPathInfo): WorldMap {
    const nodes = info.nodes;
    return applyRuleToAllButEdges(map, (point, neigh) => {
        for (let i = 0; i < nodes.length; i++) {
            const currentNode = nodes[i];
            const dist = distance(currentNode.coords, point);
            const deviatedDist = deviateNumber(dist, PATH_WIDTH_DEVIATION);
            if (deviatedDist < currentNode.diameter) {
                return WorldCell.EMPTY;
            }
        }
        return map[point.y][point.x];
    });
}

export function clearEdgesCells(map: WorldMap, info: WorldPathInfo): WorldMap {
    let newMap = map;
    const edges = info.edges;
    edges.forEach((edge) => {
        newMap = clearSingleEdgeCells(newMap, edge);
    });
    return newMap;
}

export function clearSingleEdgeCells(map: WorldMap, edge: PathEdge): WorldMap {
    return applyRuleToAllButEdges(
        map,
        (point, neigh) => checkEdgeRuleForCell(point, edge, map[point.y][point.x])
    );
}

export function checkEdgeRuleForCell(point: Point, edge: PathEdge, initial: WorldCell): WorldCell {
    const { start, end, widthModifier, freqModifier, amplModifier } = edge;

    // Вектор от start до end
    const dx = end.coords.x - start.coords.x;
    const dy = end.coords.y - start.coords.y;
    const length = Math.hypot(dx, dy);
    if (length === 0) return initial; // Защита от деления на 0

    // Нормализованный вектор направления
    const dirX = dx / length;
    const dirY = dy / length;

    // Вектор от start до текущей точки
    const px = point.x - start.coords.x;
    const py = point.y - start.coords.y;

    // Скалярное проецирование точки на отрезок — это и будет pseudoX
    const dot = px * dirX + py * dirY;
    const pseudoX = dot;

    if (pseudoX < 0 || pseudoX > length) {
        return initial;
    }

    // Ближайшая точка (cross) на отрезке
    const crossX = start.coords.x + dirX * dot;
    const crossY = start.coords.y + dirY * dot;

    // Вектор перпендикулярный направлению (влево)
    const normalX = -dirY;
    const normalY = dirX;

    // Расстояние от текущей точки до cross, со знаком
    const offsetX = point.x - crossX;
    const offsetY = point.y - crossY;
    const distance = offsetX * normalX + offsetY * normalY;

    // Значение синуса на основе pseudoX
    const pseudoY = Math.sin(pseudoX * freqModifier) * amplModifier;

    // Применяем правило
    const deviatedDistance = deviateNumber(Math.abs(distance - pseudoY), PATH_WIDTH_DEVIATION);
    if (deviatedDistance < widthModifier) {
        return WorldCell.EMPTY;
    } else {
        return initial;
    }
}

export function deviateNumber(
    factual: number,
    deviationModifier: number
): number {
    return factual * (1 - deviationModifier) + Math.random() * factual * deviationModifier * 2;
}
