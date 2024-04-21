import { useEffect, useRef, useState } from "react"
import { useSpring, animated } from "@react-spring/web"
import { useGesture } from "@use-gesture/react"
import { Block } from "../types/general"
import useBlockStore from "../store/useBlockStore"
import { BLOCK_HEIGHT, OFFSET } from "../data/Constants"
import Input from "../components/Input"

export default function IfBlock({ block_ }: { block_: Block }) {
  const ref = useRef<HTMLDivElement>(null!)
  const blocks = useBlockStore(state => state.blocks)
  const moveBlock = useBlockStore(state => state.moveBlock)
  const detachBlock = useBlockStore(state => state.detachBlock)
  const { id, initialX, initialY, inputs, color } = block_

  const [hidden, setHidden] = useState(true)
  const [condition, setCondition] = useState("Condition")

  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))

  useEffect(() => {
    if (inputs[1]) {
      select(inputs[1].toString())
    }
    useBlockStore.setState(prev => {
      prev.blocks[id].ref = ref
      prev.blocks[id].springApi = api
      if (!prev.blocks[id].next) {
        prev.blocks[id].next = prev.blocks[id + 1]
      }
      if (!prev.blocks[id + 1].prev) {
        prev.blocks[id + 1].prev = prev.blocks[id]
      }

      return prev
    })
  }, [block_])

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
        // If the movement is too little, we don't want to do anything
        const x = Math.abs(info.movement[0])
        const y = Math.abs(info.movement[1])
        if (x <= 2 && y <= 2) return

        // @ts-expect-error TS is weird
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
      onDrag: ({ down, offset: [x, y], event }) => {
        // stop any other drag events
        event.stopPropagation()

        if (!down) return
        const currDepth = blocks[id].blockDepth
        api.start({ x, y })

        moveChildren(x, y, currDepth, blocks[id].next)
      }
    },
    {
      drag: {
        from: () => [x.get(), y.get()]
      }
    }
  )

  function select(op: string) {
    useBlockStore.setState(prev => {
      prev.blocks[id].inputs[1] = op
      return prev
    })
    setHidden(p => !p)
    setCondition(op)
  }

  return (
    <>
      <animated.div
        className="border absolute w-fit h-fit p-4 touch-none z-10"
        {...bind()}
        style={{ x, y, top: initialY, left: initialX, backgroundColor: color }}
        ref={ref}
      >
        <div className="flex">
          <h1 className="mr-2">If</h1>
          <Input id={id} inputIdx={0} defaultValue={inputs[0]?.toString()} placeholder="Variable" />
          <div className="relative mx-2">
            <button onClick={() => setHidden(p => !p)} className="px-2 bg-slate-200 hover:bg-slate-300">{condition}</button>
            <div className={"absolute flex flex-col bg-white w-full " + (hidden ? "hidden" : "")}>
              <button onClick={() => select("≤")} className="text-center hover:bg-slate-200 w-full">{"≤"}</button>
              <button onClick={() => select("<")} className="text-center hover:bg-slate-200 w-full">{"<"}</button>
              <button onClick={() => select(">")} className="text-center hover:bg-slate-200 w-full">{">"}</button>
              <button onClick={() => select("≥")} className="text-center hover:bg-slate-200 w-full">{"≥"}</button>
              <button onClick={() => select("=")} className="text-center hover:bg-slate-200 w-full">{"="}</button>
            </div>
          </div>
        <Input id={id} inputIdx={2} defaultValue={inputs[2]?.toString()} placeholder="Variable" />
        </div>
      </animated.div>
    </>
  )
}
