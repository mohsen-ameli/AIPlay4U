import { useEffect, useRef } from "react"
import { useSpring, animated } from "@react-spring/web"
import { Block } from "../types/general"
import useBlockStore from "../store/useBlockStore"
import Input from "../components/Input"
import { useGesture } from "@use-gesture/react"

export default function PrintBlock({ block_ }: { block_: Block }) {
  const ref = useRef<HTMLDivElement>(null!)
  const blocks = useBlockStore(state => state.blocks)
  const moveBlock = useBlockStore(state => state.moveBlock)
  const detachBlock = useBlockStore(state => state.detachBlock)
  const { id, initialX, initialY, inputs, color } = block_

  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))

  useEffect(() => {
    useBlockStore.setState(prev => {
      prev.blocks[id].ref = ref
      prev.blocks[id].springApi = api
      return prev
    })
  }, [block_])

  const bind = useGesture(
    {
      onDragEnd: info => {
        // If the movement is too little, we don't want to do anything
        const x = Math.abs(info.movement[0])
        const y = Math.abs(info.movement[1])
        if (x <= 2 && y <= 2) return

        // @ts-expect-error TS is weird
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
      onDrag: ({ down, offset: [x, y], event }) => {
        event.stopPropagation()
        if (down) api.start({ x, y })
      }
    },
    {
      drag: {
        from: () => [x.get(), y.get()]
      }
    }
  )

  return (
    <animated.div
      {...bind()}
      style={{ x, y, top: initialY, left: initialX, backgroundColor: color }}
      ref={ref}
      className="border absolute w-fit h-fit p-4"
    >
      Print <Input id={id} inputIdx={0} defaultValue={inputs[0]?.toString()} placeholder="Stuff..." />
    </animated.div>
  )
}
