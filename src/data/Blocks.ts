import { Block } from "../types/general"
import { BLOCK_HEIGHT } from "./Constants"

export const blocks: Block[] = [
  {
    id: 0,
    type: "set",
    prev: null,
    next: null,
    ref: null!,
    initialX: 200,
    initialY: 20,
    blockDepth: 0,
  },
  {
    id: 1,
    type: "set",
    prev: null,
    next: null,
    ref: null!,
    initialX: 320,
    initialY: 20,
    blockDepth: 0,
  },
  {
    id: 2,
    type: "set",
    prev: null,
    next: null,
    ref: null!,
    initialX: 440,
    initialY: 20,
    blockDepth: 0,
  },
  {
    id: 3,
    type: "set",
    prev: null,
    next: null,
    ref: null!,
    initialX: 560,
    initialY: 20,
    blockDepth: 0,
  },
  {
    id: 4,
    type: "if",
    prev: null,
    next: null,
    ref: null!,
    initialX: 200,
    initialY: 100,
    blockDepth: 0,
  },
  {
    id: 5,
    type: "end",
    prev: null,
    next: null,
    ref: null!,
    initialX: 200,
    initialY: 100 + BLOCK_HEIGHT,
    blockDepth: 0,
  },
  {
    id: 6,
    type: "if",
    prev: null,
    next: null,
    ref: null!,
    initialX: 320,
    initialY: 100,
    blockDepth: 0,
  },
  {
    id: 7,
    type: "end",
    prev: null,
    next: null,
    ref: null!,
    initialX: 320,
    initialY: 100 + BLOCK_HEIGHT,
    blockDepth: 0,
  },
  {
    id: 8,
    type: "if",
    prev: null,
    next: null,
    ref: null!,
    initialX: 440,
    initialY: 100,
    blockDepth: 0,
  },
  {
    id: 9,
    type: "end",
    prev: null,
    next: null,
    ref: null!,
    initialX: 440,
    initialY: 100 + BLOCK_HEIGHT,
    blockDepth: 0,
  },
  {
    id: 10,
    type: "if",
    prev: null,
    next: null,
    ref: null!,
    initialX: 560,
    initialY: 100,
    blockDepth: 0,
  },
  {
    id: 11,
    type: "end",
    prev: null,
    next: null,
    ref: null!,
    initialX: 560,
    initialY: 100 + BLOCK_HEIGHT,
    blockDepth: 0,
  },
]
