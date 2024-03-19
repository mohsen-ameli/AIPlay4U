import { useEffect, useRef, useState } from "react"
import { useSpring, animated, SpringRef } from "@react-spring/web"
import { useGesture } from "@use-gesture/react"
import { create } from "zustand"

type Block = {
  id: number
  prev: Block | null
  next: Block | null
  type: "if" | "set"
  springApi?: SpringRef<{ x: number; y: number }>
  ref?: React.MutableRefObject<HTMLDivElement>
  initialX: number
  initialY: number
}

type StoreType = {
  blocks: Block[]
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
    },
    {
      id: 1,
      type: "set",
      prev: null,
      next: null,
      ref: null!,
      initialX: 140,
      initialY: 20,
    },
    {
      id: 2,
      type: "set",
      prev: null,
      next: null,
      ref: null!,
      initialX: 260,
      initialY: 20,
    },
    {
      id: 3,
      type: "set",
      prev: null,
      next: null,
      ref: null!,
      initialX: 380,
      initialY: 20,
    },
    {
      id: 4,
      type: "if",
      prev: null,
      next: null,
      ref: null!,
      initialX: 380,
      initialY: 20,
    },
  ],
  addBlock(block: Block) {},
}))

const OFFSET = 20
const BLOCK_HEIGHT = 57.6

// Updates the position of the block to be relative to the root block
function updateBlockRootPos(
  block: Block,
  root: Block,
  prevDepth: number,
  depth: number = 1
) {
  const { springApi, ref, initialX, initialY } = block
  const rootRect = root.ref?.current.getBoundingClientRect()
  if (!springApi || !ref || !rootRect) return
  const rect = ref.current.getBoundingClientRect()

  springApi.start({
    x: rootRect.x - initialX,
    y: rootRect.y - initialY + rect.height * (depth + prevDepth - 1),
  })
  if (block.next) updateBlockRootPos(block.next, root, prevDepth, ++depth)
}

// Given a node, gets the root node of the tree
function getRootBlock(block: Block) {
  if (block.prev) return getRootBlock(block.prev)
  return block
}

function printBlocks(blocks: Block[]) {
  for (const block of blocks) {
    console.log(
      `id: ${block.id} prev: ${block.prev?.id} next: ${block.next?.id}`
    )
  }
}

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
          const rect = block.ref.current.getBoundingClientRect()
          const withinBounds = clientX <= rect.right && clientX >= rect.left && clientY <= rect.bottom && clientY >= rect.top // prettier-ignore

          if (block.type === "set") {
            if (withinBounds && block.id !== id) {
              foundHit = true
              useBlockStore.setState(state => {
                const blocks = state.blocks
                const hoveringBlock = blocks[block.id]
                const currBlock = blocks[id]

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

                const root = getRootBlock(currBlock)
                updateBlockRootPos(currBlock, root, numBlocksAbove(currBlock), 1) //prettier-ignore
                return state
              })
            }
          } else if (block.type === "if" && block.ref) {
            // if we are appending this block to another block
            if (withinBounds) {
            }
          }
        }
        if (!foundHit && (block_.prev || block_.next)) {
          printBlocks(blocks)
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

            return state
          })
        }
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
        const blocks = useBlockStore.getState().blocks

        for (const block of blocks) {
          if (block.type === "if" && block.id !== id && block.ref) {
            const rect = block.ref.current.getBoundingClientRect()
            // if we are appending this block to another block
            if (
              clientX <= rect.right &&
              clientX >= rect.left &&
              clientY <= rect.bottom &&
              clientY >= rect.top
            ) {
            }
          }
        }
      },
      onDrag: ({ down, offset: [x, y] }) => {
        if (!down) return
        const rect = ref.current.getBoundingClientRect()

        api.start({ x, y })
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
        If Block
      </animated.div>
      <animated.div
        style={{ x, y, top: initialY + BLOCK_HEIGHT, left: initialX }}
        className="border absolute bg-red-300 w-fit h-fit p-4"
      >
        End Block
      </animated.div>
    </>
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

  return (
    <div className="bg-slate-800 w-screen h-screen select-none flex">
      {/* <button onClick={() => addBlock("set")}>Add Set Block</button>
      <button onClick={() => addBlock("if")}>Add If Block</button> */}
      {blocks.map(block => {
        if (block.type === "set") {
          return <SetBlock block_={block} key={block.id} />
        } else if (block.type === "if") {
          return <IfBlock block_={block} key={block.id} />
        }
      })}
    </div>
  )
}
