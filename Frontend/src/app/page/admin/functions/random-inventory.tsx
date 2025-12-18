export function getRandomInventory(min = 10, max = 1000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}