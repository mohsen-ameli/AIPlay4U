import { useEffect, useRef } from "react"
import { useSpring, animated, SpringRef } from "@react-spring/web"
import { useGesture } from "@use-gesture/react"
import { create } from "zustand"

type BlockType = {
  id: number
  x: number
  y: number
  type: "if" | "set"
  children: Set<number>
  springApi?: SpringRef<{ x: number; y: number }>
  ref?: React.MutableRefObject<HTMLDivElement>
}

type StoreType = {
  blocks: BlockType[]
}

const useBlockStore = create<StoreType>(set => ({
  blocks: [
    {
      id: 0,
      x: 0,
      y: 0,
      type: "set",
      children: new Set(),
      ref: null!,
    },
    {
      id: 1,
      x: 0,
      y: 0,
      type: "if",
      children: new Set(),
      ref: null!,
    },
    {
      id: 2,
      x: 0,
      y: 0,
      type: "set",
      children: new Set(),
      ref: null!,
    },
    {
      id: 3,
      x: 0,
      y: 0,
      type: "set",
      children: new Set(),
      ref: null!,
    },
    {
      id: 4,
      x: 0,
      y: 0,
      type: "if",
      children: new Set(),
      ref: null!,
    },
  ],
}))

const OFFSET = 20

function SetBlock({ id }: { id: number }) {
  const ref = useRef<HTMLDivElement>(null!)
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
              api.start({
                x: rect.x + OFFSET,
                y: rect.y + rect.height * (block.children.size + 1),
              })
              useBlockStore.setState(prev => {
                prev.blocks[block.id].children.add(id)
                return prev
              })
            } else if (block.children.has(id)) {
              console.log("here")
              useBlockStore.setState(prev => {
                const childrenArray = Array.from(prev.blocks[block.id].children)
                const index = childrenArray.indexOf(id)
                childrenArray.splice(index, 1)
                prev.blocks[block.id].children = new Set(childrenArray)
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
      style={{ x, y }}
      ref={ref}
    >
      Set Block
    </animated.div>
  )
}

function IfBlock({ id }: { id: number }) {
  const ref = useRef<HTMLDivElement>(null!)
  const blocks = useBlockStore(state => state.blocks)

  const [{ x, y }, api2] = useSpring(() => ({
    x: 0,
    y: 0,
  }))

  useEffect(() => {
    useBlockStore.setState(prev => {
      prev.blocks[id].ref = ref
      prev.blocks[id].springApi = api2
      return prev
    })
  }, [])

  const bind = useGesture(
    {
      onDrag: ({ down, offset: [x, y] }) => {
        if (!down) return
        const Y_VALUE_TO_REMEMBER = 137 //y.get()
        const rect = ref.current.getBoundingClientRect()

        api2.start({ x, y })

        // could make this into a function to tidy things up,
        // and run it every time a drag ends.
        if (blocks[id].children.size > 0) {
          for (const child of blocks[id].children) {
            const childrenArray = Array.from(blocks[id].children)
            const index = childrenArray.indexOf(child)
            blocks[child].springApi?.start({
              x: x + rect.width + OFFSET,
              y: y + Y_VALUE_TO_REMEMBER + rect.height * index,
            })
          }
        }
      },
    },
    {
      // drag: {
      //   from: () => [x.get(), y.get()],
      // },
    }
  )

  return (
    <animated.div
      className="border absolute left-20 top-20 bg-red-300 w-fit h-fit p-4"
      {...bind()}
      style={{ x, y }}
      ref={ref}
    >
      If Block
    </animated.div>
  )
}

export default function App() {
  const blocks = useBlockStore(state => state.blocks)

  return (
    <div className="bg-slate-800 w-screen h-screen select-none flex">
      {blocks.map(block => {
        if (block.type === "set") {
          return <SetBlock id={block.id} key={block.id} />
        } else if (block.type === "if") {
          return <IfBlock id={block.id} key={block.id} />
        }
      })}
    </div>
  )
}
