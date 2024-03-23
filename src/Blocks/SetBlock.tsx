import { useEffect, useRef } from "react"
import { useSpring, animated } from "@react-spring/web"
import { useGesture } from "@use-gesture/react"
import { Block } from "../types/general"
import useBlockStore from "../store/useBlockStore"

export default function SetBlock({ block_ }: { block_: Block }) {
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
      className="border absolute bg-cyan-300 w-fit h-fit p-4 touch-none"
      {...bind()}
      style={{ x, y, top: initialY, left: initialX }}
      ref={ref}
    >
      Set Block {id}
    </animated.div>
  )
}
