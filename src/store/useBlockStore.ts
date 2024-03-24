import { create } from "zustand"
import { StoreType, Block } from "../types/general"
import getRootBlock from "../utils/GetRootBlock"
import updateBlockRootPos from "../utils/UpdateBlockRootPos"
import numBlocksAbove from "../utils/NumBlockAbove"
import updateChildrenDepth from "../utils/UpdateChildrenDepth"
import { blocks } from "../data/Blocks"

const useBlockStore = create<StoreType>(set => ({
  blocks,
  moveBlock: (id: number, hoveringId: number) =>
    set(state => {
      const blocks = state.blocks
      const hoveringBlock = blocks[hoveringId]
      const currBlock = blocks[id]
      const prevBlock = currBlock.prev
      const endBlock = currBlock.type === "if" ? blocks[id + 1] : null

      // Handling block depth and parent if
      if (
        hoveringBlock.type === "if" &&
        currBlock.parentIf !== hoveringBlock.id
      ) {
        currBlock.blockDepth = hoveringBlock.blockDepth + 1
        currBlock.parentIf = hoveringBlock.id
      } else if (hoveringBlock.type === "end") {
        currBlock.blockDepth = hoveringBlock.blockDepth
        currBlock.parentIf = undefined
      } else if (hoveringBlock.type === "set") {
        currBlock.blockDepth = hoveringBlock.blockDepth
        currBlock.parentIf = hoveringBlock.parentIf
      }
      if (currBlock.type === "if") {
        updateChildrenDepth(
          blocks,
          currBlock.next,
          currBlock.blockDepth,
          id + 1
        )
      }
      if (endBlock) {
        endBlock.blockDepth = currBlock.blockDepth
        endBlock.parentIf = currBlock.parentIf
      }

      // Main logic for moving blocks
      if (currBlock.type === "if" && endBlock) {
        if (currBlock.prev) currBlock.prev.next = endBlock.next
        if (endBlock.next) endBlock.next.prev = currBlock.prev
        if (hoveringBlock.next) hoveringBlock.next.prev = endBlock

        endBlock.next = hoveringBlock.next
        currBlock.prev = hoveringBlock
        hoveringBlock.next = currBlock
      } else {
        if (currBlock.prev) currBlock.prev.next = currBlock.next
        if (currBlock.next) currBlock.next.prev = currBlock.prev

        currBlock.next = hoveringBlock.next

        if (hoveringBlock.next) {
          hoveringBlock.next.prev = currBlock
          if (hoveringBlock.next === currBlock) {
            hoveringBlock.next.next = null
          }
        }

        hoveringBlock.next = currBlock
        currBlock.prev = hoveringBlock
      }

      // Handling all blocks positions
      const root = getRootBlock(currBlock)
      updateBlockRootPos(root, root.next, numBlocksAbove(currBlock), 1)

      // If the block is being moved out of another block, then update that block's tree's position
      if (prevBlock) {
        const prevRoot = getRootBlock(prevBlock)
        updateBlockRootPos(prevRoot, prevRoot.next, numBlocksAbove(prevBlock), 1) // prettier-ignore
      }

      return state
    }),
  detachBlock: (id: number) =>
    set(state => {
      const blocks = state.blocks
      const currBlock = blocks[id]
      const root = getRootBlock(currBlock)

      if (currBlock.type === "if") {
        const endBlock = blocks[id + 1]

        if (currBlock.prev) currBlock.prev.next = endBlock.next
        if (endBlock.next) endBlock.next.prev = currBlock.prev

        currBlock.prev = null
        endBlock.next = null
        currBlock.parentIf = undefined
        endBlock.parentIf = undefined

        updateChildrenDepth(blocks, currBlock.next, 0, id + 1)

        currBlock.blockDepth = 0
        endBlock.blockDepth = 0
      } else {
        if (currBlock.prev) currBlock.prev.next = currBlock.next
        if (currBlock.next) currBlock.next.prev = currBlock.prev

        currBlock.next = null
        currBlock.prev = null
        currBlock.blockDepth = 0
        currBlock.parentIf = undefined
      }

      if (root.id !== currBlock.id)
        updateBlockRootPos(root, root.next, numBlocksAbove(currBlock), 1)

      return state
    }),
  addBlock: (block: Block) =>
    set(state => ({ blocks: [...state.blocks, block] }))
}))

export default useBlockStore
