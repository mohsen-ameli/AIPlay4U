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
  children?: number[] // only for if blocks
}

type StoreType = {
  blocks: Block[]
  moveGroupBlock: (id: number, hoveringId: number) => void
  moveBlock: (id: number, hoveringId: number) => void
  addBlock: (block: Block) => void
}

function getAboveIfBlock(block: Block) {
  if (block.type === "if") return block
  if (block.prev) return getAboveIfBlock(block.prev)
  return null
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
      children: [],
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
      children: [],
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
  ],
  moveGroupBlock: (id: number, hoveringId: number) => {
    // TODO: implement this
  },
  moveBlock: (id: number, hoveringId: number) =>
    set(state => {
      const blocks = state.blocks
      const hoveringBlock = blocks[hoveringId]
      const currBlock = blocks[id]
      const prevBlock = currBlock.prev

      if (currBlock.prev) {
        currBlock.prev.next = currBlock.next
      }
      if (currBlock.next) {
        currBlock.next.prev = currBlock.prev
      }
      currBlock.next = hoveringBlock.next
      if (hoveringBlock.next) {
        hoveringBlock.next.prev = currBlock
        if (hoveringBlock.next === currBlock) {
          hoveringBlock.next.next = null
        }
      }
      hoveringBlock.next = currBlock
      currBlock.prev = hoveringBlock

      // If the block is being moved into the inside of an if block
      // const rootIf = getAboveIfBlock(currBlock)
      // if (
      //   rootIf &&
      //   (hoveringBlock.type === "if" || hoveringBlock.blockDepth > 0) &&
      //   !rootIf.children?.includes(currBlock.id)
      // ) {
      //   hoveringBlock.children?.push(currBlock.id)
      //   currBlock.blockDepth += 1
      // } else if (currBlock.blockDepth > 0) {
      //   currBlock.blockDepth -= 1
      // }

      // Updating the root of the current block's tree
      const root = getRootBlock(currBlock)
      updateBlockRootPos(root, root.next, numBlocksAbove(currBlock), 1)

      // If the block is being moved out of another block, then update that block's tree
      if (prevBlock) {
        const prevRoot = getRootBlock(prevBlock)
        updateBlockRootPos(
          prevRoot,
          prevRoot.next,
          numBlocksAbove(prevBlock),
          1
        )
      }
      return state
    }),
  addBlock(block: Block) {},
}))

// Given the root of tree, updates the position of all the blocks below it
function updateBlockRootPos(
  root: Block, // constant
  next: Block | null,
  prevDepth: number, // could remove this
  i: number = 1
) {
  if (!next) return
  const { springApi, initialX, initialY, blockDepth } = next
  if (!springApi || !root.ref) return
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
        if (!foundHit && (block_.prev || block_.next)) {
          useBlockStore.setState(state => {
            const blocks = state.blocks
            const currBlock = blocks[id]
            const root = getRootBlock(currBlock)

            if (currBlock.prev) currBlock.prev.next = currBlock.next
            if (currBlock.next) currBlock.next.prev = currBlock.prev

            currBlock.next = null
            currBlock.prev = null

            updateBlockRootPos(root, root.next, numBlocksAbove(currBlock), 1)

            return state
          })
        }

        // useBlockStore.setState(state => {
        //   const currBlock = state.blocks[id]
        //   const rootIf = getAboveIfBlock(currBlock)

        //   if (!rootIf) {
        //     currBlock.blockDepth = 0
        //   } else {
        //     if (foundHit && !rootIf.children?.includes(currBlock.id)) {
        //       currBlock.blockDepth += 1
        //       rootIf.children?.push(currBlock.id)
        //     } else if (!foundHit) {
        //       currBlock.blockDepth -= 1
        //       rootIf.children?.splice(
        //         rootIf.children?.indexOf(currBlock.id) || 0,
        //         1
        //       )
        //     }
        //   }

        //   const root = getRootBlock(currBlock)
        //   updateBlockRootPos(root, root.next, numBlocksAbove(currBlock), 1)

        //   return state
        // })
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
            moveBlock(id, block.id)
          }
        }

        // Detaching this block from the other blocks
        if (!foundHit && (block_.prev || blocks[id + 1].next)) {
          useBlockStore.setState(state => {
            const blocks = state.blocks
            const currBlock = blocks[id]

            if (currBlock.prev) {
              currBlock.prev.next = currBlock.next
            }
            if (currBlock.next) {
              currBlock.next.prev = currBlock.prev
            }

            currBlock.next = null
            currBlock.prev = null
            // currBlock.blockDepth -= 1

            return state
          })
        }
      },
      onDrag: ({ down, offset: [x, y] }) => {
        if (!down) return
        api.start({ x, y })
        blocks[id + 1].springApi?.start({ x, y })

        // let i = 1
        // for (const child of children) {
        //   const childBlock = blocks[child]
        //   if (!childBlock.ref) return
        //   const rect = ref.current.getBoundingClientRect()
        //   childBlock.springApi?.start({
        //     x: x + initialX - childBlock.initialX + OFFSET,
        //     y: y + initialY - childBlock.initialY + BLOCK_HEIGHT * (children.indexOf(child) + 1), // prettier-ignore
        //   })
        // }
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

  // function addBlock(type: "if" | "set") {
  //   useBlockStore.getState().addBlock({
  //     id: blocks.length,
  //     type,
  //     ref: null!,
  //     initialX: 10 * blocks.length,
  //     initialY: 20,
  //   })
  // }

  function printBlocks() {
    const blocks = useBlockStore.getState().blocks
    console.log(blocks[6])
    // for (const block of blocks) {
    // console.log(
    //   `id: ${block.id} prev: ${block.prev?.id} next: ${block.next?.id}`
    // )
    // }
  }

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
