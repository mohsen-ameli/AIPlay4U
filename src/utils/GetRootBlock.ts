import { Block } from "../types/general"

// Given a node, gets the root node of the tree
// time complexity: O(n)
export default function getRootBlock(block: Block) {
  if (block.prev) return getRootBlock(block.prev)
  return block
}
