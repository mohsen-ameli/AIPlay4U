import { create } from "zustand"
import { StoreType, Block } from "../types/general"
import getRootBlock from "../utils/GetRootBlock"
import updateBlockRootPos from "../utils/UpdateBlockRootPos"
import numBlocksAbove from "../utils/NumBlockAbove"
import updateChildrenDepth from "../utils/UpdateChildrenDepth"

const useBlockStore = create<StoreType>((set, get) => ({
  blocks: [
    {
      id: 0,
      type: "start",
      prev: null,
      next: null,
      initialX: 200,
      initialY: 20,
      blockDepth: 0,
      inputs: []
    }
  ],
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
  runProgram: () => {
    let block: Block | null = get().blocks[0]
    const blocksToSave = []
    while (block) {
      blocksToSave.push({
        id: block.id,
        type: block.type,
        prev: block.prev ? block.prev.id : -1,
        next: block.next ? block.next.id : -1,
        inputs: block.inputs
      })
      block = block.next
    }
    window.electron.saveFile("runner.json", JSON.stringify(blocksToSave))
    console.log(window.electron.run("runner.json"))
  },
  addBlock: (block: Block) =>
    set(state => ({ blocks: [...state.blocks, block] })),
  saveBlocks: () => {
    const blocksToSave = []
    for (const block of get().blocks) {
      const rect = block.ref?.current?.getBoundingClientRect()
      blocksToSave.push({
        id: block.id,
        type: block.type,
        prev: block.prev ? block.prev.id : null,
        next: block.next ? block.next.id : null,
        parentIf: block.parentIf,
        initialX: rect?.x,
        initialY: rect?.y,
        inputs: block.inputs,
        blockDepth: block.blockDepth
      })
    }
    window.electron.saveFile("blocks.json", JSON.stringify(blocksToSave))
  },
  loadBlocks: () => {
    // reset all blocks to initial position
    for (const block of get().blocks) {
      block.springApi?.start({ x: 0, y: 0 })
    }

    // load blocks from file
    const blocks: Block[] = JSON.parse(window.electron.loadFile("blocks.json"))

    // update the block store with the loaded blocks
    for (const block of blocks) {
      block.prev = block.prev !== null ? blocks[block.prev as unknown as number] : null //prettier-ignore
      block.next = block.next !== null ? blocks[block.next as unknown as number] : null //prettier-ignore
    }
    console.log(blocks)
    set({ blocks })
  },
  notification: {
    message: "",
    show: false,
    type: "success",
    yes: {
      text: "Yes",
      onClick: () => {}
    },
    no: {
      text: "No",
      onClick: () => {}
    }
  }
}))

export default useBlockStore
