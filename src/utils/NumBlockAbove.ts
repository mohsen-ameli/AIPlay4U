import { Block } from "../types/general"

// time complexity: O(n)
export default function numBlocksAbove(block: Block) {
  let total = 0
  if (block.prev) {
    total += 1 + numBlocksAbove(block.prev)
    return total
  } else return total
}
