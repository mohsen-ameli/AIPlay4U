import { useEffect, useRef } from "react"
import { useSpring, animated } from "@react-spring/web"
import { Block } from "../types/general"
import useBlockStore from "../store/useBlockStore"

export default function EndBlock({ block_ }: { block_: Block }) {
  const ref = useRef<HTMLDivElement>(null!)
  const { id, initialX, initialY } = block_

  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))

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
      Closing If
    </animated.div>
  )
}
