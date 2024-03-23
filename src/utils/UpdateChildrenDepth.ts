import { Block } from "../types/general"

// Given a block, updates the depth of all the children blocks
export default function updateChildrenDepth(
  blocks: Block[],
  block: Block | null,
  currDepth: number,
  endBlockId: number,
  depth: number = 0,
) {
  if (!block) return -1

  if (block.id === endBlockId) {
    if (block) block.blockDepth = currDepth + depth
    return endBlockId
  }

  block.blockDepth = currDepth + depth + 1
  if (block.type === "if") {
    const newEndId = block.id + 1
    const a = updateChildrenDepth(blocks, block.next, currDepth, newEndId, depth + 1) //prettier-ignore
    if (a > 0) {
      block = blocks[a]
    }
  }
  if (!block) return -1
  return updateChildrenDepth(blocks, block.next, currDepth, endBlockId, depth)
}
