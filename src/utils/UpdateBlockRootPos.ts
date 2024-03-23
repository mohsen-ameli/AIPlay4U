import { BLOCK_HEIGHT, OFFSET } from "../data/Constants"
import { Block } from "../types/general"

// Given the root of tree, updates the position of all the blocks below it
export default function updateBlockRootPos(
  root: Block, // constant
  next: Block | null,
  prevDepth: number, // could remove this
  i: number = 1
) {
  if (!next || !root.ref || !next.springApi) return

  const { springApi, initialX, initialY, blockDepth } = next
  const rootRect = root.ref.current.getBoundingClientRect()

  springApi.start({
    x: rootRect.x - initialX + OFFSET * blockDepth,
    y: rootRect.y - initialY + BLOCK_HEIGHT * i,
  })

  if (next.next) updateBlockRootPos(root, next.next, prevDepth, ++i)
}
