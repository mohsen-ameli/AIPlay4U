import { motion } from "framer-motion"
import { useRef, useState } from "react"
import { useSpring, animated, SpringRef } from "@react-spring/web"
import { useGesture } from "@use-gesture/react"
import { create } from "zustand"

type BlockType = {
  id: number
  x: number
  y: number
  type: "if" | "set"
  children: number[]
  springApi?: SpringRef<{ x: number; y: number }>
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
      children: [],
    },
    {
      id: 1,
      x: 0,
      y: 0,
      type: "if",
      children: [],
    },
  ],
}))

const OFFSET = 20

function SetBlock() {
  return (
    <motion.div className="border bg-cyan-300 w-fit" drag dragMomentum={false}>
      Set Block
    </motion.div>
  )
}

function IfBlock() {
  return (
    <motion.div className="border bg-red-300 w-fit" drag dragMomentum={false}>
      If Block
    </motion.div>
  )
}

export default function App() {
  const ifRef = useRef<HTMLDivElement>(null!)
  const setRef = useRef<HTMLDivElement>(null!)

  const blocks = useBlockStore(state => state.blocks)

  const [{ x, y }, api] = useSpring(() => ({
    x: 0,
    y: 0,
  }))

  const bind = useGesture(
    {
      onDragEnd: info => {
        // @ts-ignore
        const { clientX, clientY } = info.event
        const rect = ifRef.current.getBoundingClientRect()

        if (
          clientX <= rect.right &&
          clientX >= rect.left &&
          clientY <= rect.bottom &&
          clientY >= rect.top
        ) {
          // move this box below the if block
          api.start({
            x: rect.x + OFFSET,
            y: rect.y + rect.height,
          })
          useBlockStore.setState(prev => {
            prev.blocks[1].children = [0]
            return prev
          })
        } else {
          useBlockStore.setState(prev => {
            prev.blocks[1].children = []
            return prev
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

  const [{ x: x2, y: y2 }, api2] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    rotateZ: 0,
  }))

  const bind2 = useGesture(
    {
      onDrag: ({ down, offset: [x2, y2] }) => {
        if (!down) return
        const Y_VALUE_TO_REMEMBER = 137 //y.get()
        const rect = ifRef.current.getBoundingClientRect()

        api2.start({ x: x2, y: y2 })
        if (blocks[1].children.length > 0) {
          api.start({
            x: x2 + rect.width + OFFSET,
            y: y2 + Y_VALUE_TO_REMEMBER,
          })
        }
      },
    },
    {
      // drag: {
      //   from: () => [x2.get(), y2.get()],
      // },
    }
  )

  return (
    <>
      <div className="bg-slate-800 w-screen h-screen select-none flex">
        <animated.div
          className="border absolute left-20 top-20 bg-red-300 w-fit h-fit p-4"
          {...bind2()}
          style={{ x: x2, y: y2 }}
          ref={ifRef}
        >
          If Block
        </animated.div>
        <animated.div
          className="border absolute bg-cyan-300 w-fit h-fit p-4"
          {...bind()}
          style={{ x, y }}
          ref={setRef}
        >
          Set Block
        </animated.div>
        {/* <div
          id="if-block"
          className="border absolute left-20 top-40 bg-red-300 w-fit h-fit p-4"
        >
          End If Block
        </div> */}
      </div>
    </>
  )
}
