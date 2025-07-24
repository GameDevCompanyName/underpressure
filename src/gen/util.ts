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
