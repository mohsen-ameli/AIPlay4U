import { useEffect, useRef } from "react"
import { useSpring, animated } from "@react-spring/web"
import { useDrag } from "@use-gesture/react"
import { Block } from "../types/general"
import useBlockStore from "../store/useBlockStore"
import { BLOCK_HEIGHT, OFFSET } from "../data/Constants"

export default function StartBlock({ block_ }: { block_: Block }) {
  const ref = useRef<HTMLDivElement>(null!)
  const blocks = useBlockStore(state => state.blocks)
  const { id, initialX, initialY } = block_

  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))

  useEffect(() => {
    useBlockStore.setState(prev => {
      prev.blocks[id].ref = ref
      prev.blocks[id].springApi = api
      return prev
    })
  }, [block_])

  // Move the children blocks
  // Only for start block
  function moveChildren(
    x: number,
    y: number,
    block: Block | null,
    i: number = 1
  ) {
    if (!block) return
    // prettier-ignore
    block.springApi?.start({
      x: x + initialX - block.initialX + OFFSET * block.blockDepth,
      y: y + initialY - block.initialY + BLOCK_HEIGHT * i,
    })
    moveChildren(x, y, block.next, ++i)
  }

  const bind = useDrag(
    ({ down, offset: [x, y], event }) => {
      // stop any other drag events
      event.stopPropagation()

      if (!down) return

      api.start({ x, y })
      moveChildren(x, y, blocks[id].next)
    },
    {
      from: () => [x.get(), y.get()]
    }
  )

  return (
    <animated.div
      className="border absolute bg-orange-300 w-fit h-fit p-4 touch-none"
      {...bind()}
      style={{ x, y, top: initialY, left: initialX }}
      ref={ref}
    >
      Start Block
    </animated.div>
  )
}
