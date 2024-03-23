import { Block } from "../types/general"

// Given a block, updates the depth of all the children blocks
export default function updateChildrenDepth(
  blocks: Block[],
  block: Block | null,
  currDepth: number,
  endBlockId: number,
  depth: number = 0
) {
  if (!block) return -1
  console.log("id: ", block.id, "blockDepth: ", block.blockDepth)
  if (block.id === endBlockId) {
    if (block) block.blockDepth = currDepth + depth
    return endBlockId
  }

  block.blockDepth = currDepth + depth + 1

  if (block.type === "if") {
    const newEndBlockId = block.id + 1
    while (block) {
      const a = updateChildrenDepth(blocks, block.next, currDepth, newEndBlockId, depth + 1) //prettier-ignore
      if (a > 0) {
        block = blocks[a]
      }
      if (block.id === endBlockId) {
        break
      }
      block = block.next
    }
  }
  if (!block) return -1
  updateChildrenDepth(blocks, block.next, currDepth, endBlockId, depth)
  return -1
}
