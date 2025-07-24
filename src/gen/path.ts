import { applyRuleToAllButEdges, applyRuleToCoords, Map, World, WorldCell } from "./common";
import { AVERAGE_NODE_DIAMETER, AVERAGE_NODE_DISTANCE, WORLD_PADDING } from "./const";
import { distance } from "./util";

export interface PathNode {
    coords: Point;
    type: PathNodeType;
    diameter: number;
}

export enum PathNodeType {
    START, END, COMMON
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

export function generatePathInfo(map: Map): WorldPathInfo {
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

    for (let i = 0; i < count; i++) {
        const currentX = Math.floor(WORLD_PADDING + distanceX * i + distanceX / 2);
        const currentY = Math.floor(WORLD_PADDING + innerHeight * Math.random());
        const type = i === 0 ? PathNodeType.START : i === count - 1 ? PathNodeType.END : PathNodeType.COMMON;

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
                widthModifier: 2 + Math.random() * 4,
                freqModifier: Math.random() / 2,
                amplModifier: 2 + Math.random() * 3
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

export function clearNodeCells(map: Map, info: WorldPathInfo): Map {
    const nodes = info.nodes;
    return applyRuleToAllButEdges(map, (point, neigh) => {
        for (let i = 0; i < nodes.length; i++) {
            const currentNode = nodes[i];
            if (distance(currentNode.coords, point) < currentNode.diameter) {
                return WorldCell.EMPTY;
            }
        }
        return map[point.y][point.x];
    });
}

export function clearEdgesCells(map: Map, info: WorldPathInfo): Map {
    let newMap = map;
    const edges = info.edges;
    edges.forEach((edge) => {
        newMap = clearSingleEdgeCells(newMap, edge);
    });
    return newMap;
}

export function clearSingleEdgeCells(map: Map, edge: PathEdge): Map {
    return applyRuleToCoords(
        map,
        edge.start.coords.x,
        edge.end.coords.x,
        1,
        map.length - 1,
        (point, neigh) => checkEdgeRuleForCell(point, edge, map[point.y][point.x])
    );
}

export function checkEdgeRuleForCell(point: Point, edge: PathEdge, initial: WorldCell): WorldCell {
    const { start, end, widthModifier, freqModifier, amplModifier } = edge;

    // Вектор от start до end
    const dx = end.coords.x - start.coords.x;
    const dy = end.coords.y - start.coords.y;
    const length = Math.hypot(dx, dy);
    if (length === 0) return WorldCell.WALL; // Защита от деления на 0

    // Нормализованный вектор направления
    const dirX = dx / length;
    const dirY = dy / length;

    // Вектор от start до текущей точки
    const px = point.x - start.coords.x;
    const py = point.y - start.coords.y;

    // Скалярное проецирование точки на отрезок — это и будет pseudoX
    const dot = px * dirX + py * dirY;
    const pseudoX = dot;

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
    if (Math.abs(distance - pseudoY) < widthModifier) {
        return WorldCell.EMPTY;
    } else {
        return initial;
    }
}
