let id = 0;

export function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
}

export function getNextUniqueId(): number {
    return id++;
}
