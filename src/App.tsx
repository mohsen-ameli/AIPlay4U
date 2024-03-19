import { useEffect, useRef } from "react"
import { useSpring, animated, SpringRef } from "@react-spring/web"
import { useGesture } from "@use-gesture/react"
import { create } from "zustand"

type Block = {
  id: number
  type: "if" | "set"
  children: number[]
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
      children: [],
      ref: null!,
      initialX: 20,
      initialY: 20,
    },
    {
      id: 1,
      type: "if",
      children: [],
      ref: null!,
      initialX: 140,
      initialY: 20,
    },
    {
      id: 2,
      type: "set",
      children: [],
      ref: null!,
      initialX: 260,
      initialY: 20,
    },
    {
      id: 3,
      type: "set",
      children: [],
      ref: null!,
      initialX: 380,
      initialY: 20,
    },
    {
      id: 4,
      type: "if",
      children: [],
      ref: null!,
      initialX: 500,
      initialY: 20,
    },
  ],
  addBlock: (block: Block) =>
    set(state => ({ blocks: [...state.blocks, block] })),
}))

function getTotalNumOfChildren(block: Block, blocks: Block[]): number {
  let total = 0
  for (const child of block.children) {
    total += getTotalNumOfChildren(blocks[child], blocks)
  }
  return total + block.children.length
}

const OFFSET = 20

function SetBlock({ block_ }: { block_: Block }) {
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

  const bind = useGesture(
    {
      onDragEnd: info => {
        // @ts-ignore
        const { clientX, clientY } = info.event
        const blocks = useBlockStore.getState().blocks

        // I think this is okay to do. We loop over all blocks,
        // to see if this block is overlapping with any of them.
        for (const block of blocks) {
          if (block.type === "if" && block.ref) {
            const rect = block.ref.current.getBoundingClientRect()
            // if we are appending this block to another block
            if (
              clientX <= rect.right &&
              clientX >= rect.left &&
              clientY <= rect.bottom &&
              clientY >= rect.top
            ) {
              if (block.children.includes(id)) {
                api.start({
                  x: rect.x - initialX + OFFSET,
                  y:
                    rect.y -
                    initialY +
                    rect.height * (block.children.indexOf(id) + 1),
                })
                return
              }
              api.start({
                x: rect.x - initialX + OFFSET,
                y:
                  rect.y -
                  initialY +
                  rect.height * (getTotalNumOfChildren(block, blocks) + 1),
              })
              useBlockStore.setState(prev => {
                // if the block is not already in the children array
                if (!prev.blocks[block.id].children.includes(id))
                  prev.blocks[block.id].children.push(id)
                return prev
              })
            } else if (block.children.includes(id)) {
              useBlockStore.setState(prev => {
                prev.blocks[block.id].children = prev.blocks[
                  block.id
                ].children.filter(child => child !== id)
                return prev
              })
            }
          }
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
      Set Block
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
              // move the current block
              api.start({
                x: rect.x - initialX + OFFSET,
                y:
                  rect.y - initialY + rect.height * (block.children.length + 1),
              })
              let i = 1
              for (const child of blocks[id].children) {
                blocks[child].springApi?.start({
                  x: rect.left - blocks[child].initialX + OFFSET * 2,
                  y:
                    rect.top -
                    blocks[child].initialY +
                    rect.height * (block.children.length + i + 1),
                })
                i++
              }
              useBlockStore.setState(prev => {
                // if the block is not already in the children array
                if (!prev.blocks[block.id].children.includes(id))
                  prev.blocks[block.id].children.push(id)
                return prev
              })
            } else if (block.children.includes(id)) {
              useBlockStore.setState(prev => {
                prev.blocks[block.id].children = prev.blocks[
                  block.id
                ].children.filter(child => child !== id)
                return prev
              })
            }
          }
        }
      },
      onDrag: ({ down, offset: [x, y] }) => {
        if (!down) return
        const rect = ref.current.getBoundingClientRect()

        api.start({ x, y })

        // could make this into a function to tidy things up,
        // and run it every time a drag ends.
        if (blocks[id].children.length === 0) return

        // recursively update the children
        let i = 0
        function updateChildren(id: number, depth: number) {
          for (const child of blocks[id].children) {
            i++
            blocks[child].springApi?.start({
              x: x + initialX - blocks[child].initialX + OFFSET * depth,
              y: y + initialY - blocks[child].initialY + rect.height * i,
            })
            updateChildren(child, depth + 1)
          }
        }
        updateChildren(id, 1)
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
      className="border absolute bg-red-300 w-fit h-fit p-4"
      {...bind()}
      style={{ x, y, top: initialY, left: initialX }}
      ref={ref}
    >
      If Block
    </animated.div>
  )
}

export default function App() {
  const blocks = useBlockStore(state => state.blocks)

  function addBlock(type: "if" | "set") {
    useBlockStore.getState().addBlock({
      id: blocks.length,
      type,
      children: [],
      ref: null!,
      initialX: 10 * blocks.length,
      initialY: 20,
    })
  }

  return (
    <div className="bg-slate-800 w-screen h-screen select-none flex">
      <button onClick={() => addBlock("set")}>Add Set Block</button>
      <button onClick={() => addBlock("if")}>Add If Block</button>
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
