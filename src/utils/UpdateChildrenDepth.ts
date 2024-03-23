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
  console.log(
    "call ",
    block.id,
    "blockDepth: ",
    block.blockDepth,
    "end id",
    endBlockId,
  )

  if (block.id === endBlockId) {
    if (block) block.blockDepth = currDepth + depth
    return endBlockId
  }

  block.blockDepth = currDepth + depth + 1
  // console.log("new depth: ", block.blockDepth)
  // let curr: Block | null = block
  if (block.type === "if") {
    const newEndId = block.id + 1
    while (block) {
      // console.log("caller if", block.id)
      const a = updateChildrenDepth(blocks, block.next, currDepth, newEndId, depth + 1) //prettier-ignore
      if (block.id === newEndId) {
        break
      }
      block = block.next
      if (a > 0) {
        console.log("hi")
        block = blocks[a]
        break
      }
    }
    // if (curr) {
    //   console.log("caller after while", curr.id)
    //   return updateChildrenDepth(
    //     blocks,
    //     curr.next,
    //     currDepth,
    //     endBlockId,
    //     depth,
    //   )
    // }
    // return -1
  }
  if (!block) return -1
  // console.log("caller state", block.id)
  return updateChildrenDepth(blocks, block.next, currDepth, endBlockId, depth)
}
