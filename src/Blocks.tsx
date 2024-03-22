import { useEffect, useRef } from "react"
import { useSpring, animated, SpringRef } from "@react-spring/web"
import { useGesture } from "@use-gesture/react"
import { create } from "zustand"

const OFFSET = 20
const BLOCK_HEIGHT = 57.6

type Block = {
  id: number
  prev: Block | null
  next: Block | null
  type: "if" | "set" | "end"
  springApi?: SpringRef<{ x: number; y: number }>
  ref?: React.MutableRefObject<HTMLDivElement>
  initialX: number
  initialY: number
  blockDepth: number // how many ifs is this block inside of
  parentIf?: number
}

type StoreType = {
  blocks: Block[]
  moveBlock: (id: number, hoveringId: number) => void
  detachBlock: (id: number) => void
  addBlock: (block: Block) => void
}

const useBlockStore = create<StoreType>(set => ({
  blocks: [
    {
      id: 0,
      type: "set",
      prev: null,
      next: null,
      ref: null!,
      initialX: 20,
      initialY: 20,
      blockDepth: 0,
    },
    {
      id: 1,
      type: "set",
      prev: null,
      next: null,
      ref: null!,
      initialX: 140,
      initialY: 20,
      blockDepth: 0,
    },
    {
      id: 2,
      type: "set",
      prev: null,
      next: null,
      ref: null!,
      initialX: 260,
      initialY: 20,
      blockDepth: 0,
    },
    {
      id: 3,
      type: "set",
      prev: null,
      next: null,
      ref: null!,
      initialX: 380,
      initialY: 20,
      blockDepth: 0,
    },
    {
      id: 4,
      type: "if",
      prev: null,
      next: null,
      ref: null!,
      initialX: 500,
      initialY: 20,
      blockDepth: 0,
    },
    {
      id: 5,
      type: "end",
      prev: null,
      next: null,
      ref: null!,
      initialX: 500,
      initialY: 20 + BLOCK_HEIGHT,
      blockDepth: 0,
    },
    {
      id: 6,
      type: "if",
      prev: null,
      next: null,
      ref: null!,
      initialX: 140,
      initialY: 100,
      blockDepth: 0,
    },
    {
      id: 7,
      type: "end",
      prev: null,
      next: null,
      ref: null!,
      initialX: 140,
      initialY: 100 + BLOCK_HEIGHT,
      blockDepth: 0,
    },
    {
      id: 8,
      type: "if",
      prev: null,
      next: null,
      ref: null!,
      initialX: 260,
      initialY: 100,
      blockDepth: 0,
    },
    {
      id: 9,
      type: "end",
      prev: null,
      next: null,
      ref: null!,
      initialX: 260,
      initialY: 100 + BLOCK_HEIGHT,
      blockDepth: 0,
    },
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
        updateChildrenDepth(currBlock.next, currBlock.blockDepth, id + 1)
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

        updateChildrenDepth(currBlock.next, 0, id + 1)

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
  addBlock(block: Block) {},
}))

// Given a block, updates the depth of all the children blocks
function updateChildrenDepth(
  block: Block | null,
  currDepth: number,
  endBlockId: number,
  depth: number = 0
) {
  if (!block || block.id === endBlockId) {
    if (block) block.blockDepth = currDepth
    return
  }
  block.blockDepth = currDepth + depth + 1
  if (block.type === "if") {
    updateChildrenDepth(block.next, currDepth, block.id + 1, depth + 1)
    block = block.next
    depth = 0
  }
  if (!block) return
  updateChildrenDepth(block.next, currDepth, endBlockId, depth)
}

// Given the root of tree, updates the position of all the blocks below it
function updateBlockRootPos(
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

// Given a node, gets the root node of the tree
// time complexity: O(n)
function getRootBlock(block: Block) {
  if (block.prev) return getRootBlock(block.prev)
  return block
}

// time complexity: O(n)
function numBlocksAbove(block: Block) {
  let total = 0
  if (block.prev) {
    total += 1 + numBlocksAbove(block.prev)
    return total
  } else return total
}

function SetBlock({ block_ }: { block_: Block }) {
  const ref = useRef<HTMLDivElement>(null!)
  const blocks = useBlockStore(state => state.blocks)
  const moveBlock = useBlockStore(state => state.moveBlock)
  const detachBlock = useBlockStore(state => state.detachBlock)
  const { id, initialX, initialY } = block_

  const [{ x, y }, api] = useSpring(() => ({
    x: 0,
    y: 0,
  }))

  useEffect(() => {
    useBlockStore.setState(prev => {
      prev.blocks[id].ref = ref
      prev.blocks[id].springApi = api
      return prev
    })
  }, [])

  const bind = useGesture(
    {
      onDragEnd: info => {
        // @ts-ignore
        const { clientX, clientY } = info.event

        // I think this is okay to do. We loop over all blocks,
        // to see if this block is overlapping with any of them.
        let foundHit = false
        for (const block of blocks) {
          if (!block.ref) return
          if (block.id === id) continue
          const rect = block.ref.current.getBoundingClientRect()
          const withinBounds = clientX <= rect.right && clientX >= rect.left && clientY <= rect.bottom && clientY >= rect.top // prettier-ignore

          // If we are moving this block to another block
          if (withinBounds) {
            foundHit = true
            moveBlock(id, block.id)
          }
        }

        // Detaching this block from the other blocks
        if (!foundHit && (block_.prev || block_.next)) detachBlock(id)
      },
      onDrag: ({ down, offset: [x, y] }) => {
        if (down) api.start({ x, y })
      },
    },
    {
      drag: {
        from: () => [x.get(), y.get()],
      },
    }
  )

  return (
    <animated.div
      className="border absolute bg-cyan-300 w-fit h-fit p-4"
      {...bind()}
      style={{ x, y, top: initialY, left: initialX }}
      ref={ref}
    >
      Set Block {id}
    </animated.div>
  )
}

function IfBlock({ block_ }: { block_: Block }) {
  const ref = useRef<HTMLDivElement>(null!)
  const blocks = useBlockStore(state => state.blocks)
  const moveBlock = useBlockStore(state => state.moveBlock)
  const detachBlock = useBlockStore(state => state.detachBlock)
  const { id, initialX, initialY } = block_

  const [{ x, y }, api] = useSpring(() => ({
    x: 0,
    y: 0,
  }))

  useEffect(() => {
    useBlockStore.setState(prev => {
      prev.blocks[id].ref = ref
      prev.blocks[id].springApi = api
      prev.blocks[id].next = prev.blocks[id + 1]
      prev.blocks[id + 1].prev = prev.blocks[id]

      return prev
    })
  }, [])

  // Move the children blocks
  // Only for if blocks
  function moveChildren(
    x: number,
    y: number,
    currDepth: number,
    block: Block | null,
    i: number = 1
  ) {
    if (!block) return
    if (!block.next || block.id === id + 1) {
      block.springApi?.start({ x, y: y + BLOCK_HEIGHT * (i - 1) })
      return
    }
    // prettier-ignore
    block.springApi?.start({
      x: x + initialX - block.initialX + OFFSET * (block.blockDepth - currDepth), 
      y: y + initialY - block.initialY + BLOCK_HEIGHT * i,
    })
    moveChildren(x, y, currDepth, block.next, ++i)
  }

  // If the block is a child of another block
  // Only for if blocks
  function isChildOf(block: Block, targetId: number, endBlockId: number) {
    if (!block.next) return false
    if (block.id === endBlockId) return false
    if (block.id === targetId) return true
    return isChildOf(block.next, targetId, endBlockId)
  }

  const bind = useGesture(
    {
      onDragEnd: info => {
        // @ts-ignore
        const { clientX, clientY } = info.event
        const blocks = useBlockStore.getState().blocks

        let foundHit = false
        for (const block of blocks) {
          if (!block.ref) return
          if (block.id === id || block.id === id + 1) continue

          const rect = block.ref.current.getBoundingClientRect()
          const withinBounds = clientX <= rect.right && clientX >= rect.left && clientY <= rect.bottom && clientY >= rect.top // prettier-ignore

          // if we are appending this block to another block
          if (withinBounds) {
            foundHit = true
            if (isChildOf(blocks[id], block.id, id + 1)) return
            moveBlock(id, block.id)
          }
        }

        // Detaching this block from the other blocks
        if (!foundHit && (block_.prev || blocks[id + 1].next)) detachBlock(id)
      },
      onDrag: ({ down, offset: [x, y] }) => {
        if (!down) return
        const currDepth = blocks[id].blockDepth
        api.start({ x, y })

        moveChildren(x, y, currDepth, blocks[id].next)
      },
    },
    {
      drag: {
        from: () => [x.get(), y.get()],
      },
    }
  )

  return (
    <>
      <animated.div
        className="border absolute bg-red-300 w-fit h-fit p-4"
        {...bind()}
        style={{ x, y, top: initialY, left: initialX }}
        ref={ref}
      >
        If Block {id}
      </animated.div>
    </>
  )
}

function EndBlock({ block_ }: { block_: Block }) {
  const ref = useRef<HTMLDivElement>(null!)
  const { id, initialX, initialY } = block_

  const [{ x, y }, api] = useSpring(() => ({
    x: 0,
    y: 0,
  }))

  useEffect(() => {
    useBlockStore.setState(prev => {
      prev.blocks[id].ref = ref
      prev.blocks[id].springApi = api
      return prev
    })
  }, [])

  return (
    <animated.div
      style={{ x, y, top: initialY, left: initialX }}
      ref={ref}
      className="border absolute bg-red-300 w-fit h-fit p-4"
    >
      End Block {id}
    </animated.div>
  )
}

export default function Blocks() {
  const blocks = useBlockStore(state => state.blocks)

  function printBlocks() {
    const blocks = useBlockStore.getState().blocks
    for (const block of blocks) {
      console.log(
        `id: ${block.id} prev: ${block.prev?.id} next: ${block.next?.id} depth: ${block.blockDepth}`
      )
      // console.log(block)
    }
  }

  // function addBlock(type: "if" | "set") {
  //   useBlockStore.getState().addBlock({
  //     id: blocks.length,
  //     type,
  //     ref: null!,
  //     initialX: 10 * blocks.length,
  //     initialY: 20,
  //   })
  // }

  return (
    <div className="bg-slate-800 w-screen h-screen select-none flex">
      {/* <button onClick={() => addBlock("set")}>Add Set Block</button>
      <button onClick={() => addBlock("if")}>Add If Block</button> */}
      <button
        className="w-fit h-fit border bg-teal-500 p-2 rounded-md text-white top-1/2 absolute"
        onClick={printBlocks}
      >
        Print All Blocks
      </button>
      {blocks.map(block => {
        if (block.type === "set") {
          return <SetBlock block_={block} key={block.id} />
        } else if (block.type === "if") {
          return <IfBlock block_={block} key={block.id} />
        } else {
          return <EndBlock block_={block} key={block.id} />
        }
      })}
    </div>
  )
}
