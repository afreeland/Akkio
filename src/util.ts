import sha256 from "crypto-js/sha256";

export const CANVAS_SIZE = 350;
export const BLOCK_SIZE = 7;

export const UNIT_MULTIPLIER = CANVAS_SIZE / BLOCK_SIZE;

const CANVAS_HEIGHT = 7;
const CANVAS_WIDTH = 7;

/**
 *
 * @param str A basic string that needs to be hashed
 * @param seed A seed value to join with our basic str
 * @returns A sha256 hash
 */
export function generateHash(str: string, seed: string): string {
  // Concatenate the string and seed value
  const input = str + seed;

  // Generate a hash using the SHA256 algorithm
  const hashDigest = sha256(input);

  return hashDigest.toString();
}

export interface Shape {
  type: string;
  dimensions: number[];
  position: [number, number];
}

/**
 *
 * @param str A sha256 string
 */
export function splitHash(str: string): string[] {
  const split = [];
  // Numbers of characters to chunk together
  const numChar = 8;
  for (let i = 0; i < str.length; i += numChar) {
    split.push(str.slice(i, i + numChar));
  }

  return split;
}

export function generateShapeFromHash(
  hash: string,
  sizeMin: number,
  sizeMax: number,
  canvasWidth: number = CANVAS_WIDTH / 2, // Only using half so we can mirror at the end (ended up not mirroring image o.O)
  canvasHeight: number = CANVAS_HEIGHT
): Shape {
  // Take some form of hash and convert into a random number
  const hashInt = parseInt(hash, 16);
  // Get a random type (rect/circle/triangle/etc)
  const shapeTypeIndex = hashInt % 3;
  // Generate a random number between two given values, ensuring that we at least our 1 'unit' large.
  const shapeSize = Math.floor((hashInt % (sizeMax - sizeMin + 1)) + sizeMin);

  const xPos = Math.floor(
    (hashInt % (canvasWidth - shapeSize)) + shapeSize / 2
  );
  const yPos = Math.floor(
    (hashInt % (canvasHeight - shapeSize)) + shapeSize / 2
  );

  switch (shapeTypeIndex) {
    case 0:
      return {
        type: "rectangle",
        dimensions: [shapeSize * 2, shapeSize],
        position: [xPos, yPos],
      };
    case 1:
      return {
        type: "circle",
        dimensions: [shapeSize],
        position: [xPos, yPos],
      };
    case 2:
      return {
        type: "triangle",
        dimensions: [shapeSize],
        position: [xPos, yPos],
      };
    default:
      return {
        type: "rectangle",
        dimensions: [shapeSize * 2, shapeSize],
        position: [xPos, yPos],
      };
  }
}
