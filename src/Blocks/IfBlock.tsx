import { useEffect, useRef, useState } from "react"
import { useSpring, animated } from "@react-spring/web"
import { useGesture } from "@use-gesture/react"
import { Block } from "../types/general"
import useBlockStore from "../store/useBlockStore"
import { BLOCK_HEIGHT, OFFSET } from "../data/Constants"

export default function IfBlock({ block_ }: { block_: Block }) {
  const ref = useRef<HTMLDivElement>(null!)
  const blocks = useBlockStore(state => state.blocks)
  const moveBlock = useBlockStore(state => state.moveBlock)
  const detachBlock = useBlockStore(state => state.detachBlock)
  const { id, initialX, initialY } = block_

  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))

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

  return (
    <>
      <animated.div
        className="border absolute bg-red-300 w-fit h-fit p-4 touch-none"
        {...bind()}
        style={{ x, y, top: initialY, left: initialX }}
        ref={ref}
      >
        If <Input />
      </animated.div>
    </>
  )
}

function Input() {
  const [value, setValue] = useState("")

  return (
    <input
      onChange={e => setValue(e.target.value)}
      size={value.length - 1 <= 0 ? 1 : value.length - 1}
      className="max-w-44 min-w-[5.4rem] pl-2"
      placeholder="Condition"
    />
  )
}
