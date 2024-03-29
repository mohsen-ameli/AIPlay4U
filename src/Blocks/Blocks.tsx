import useBlockStore from "../store/useBlockStore"
import SetBlock from "./SetBlock"
import IfBlock from "./IfBlock"
import EndBlock from "./EndBlock"
import StartBlock from "./StartBlock"
// import { useSpring, animated } from "@react-spring/web"
// import { useDrag, useGesture } from "@use-gesture/react"
// import { useEffect, useRef, useState } from "react"

export default function Blocks() {
  const blocks = useBlockStore(state => state.blocks)
  // const [cursor, setCursor] = useState<"grab" | "grabbing">("grab")
  // const ref = useRef<HTMLDivElement>(null!)

  // useEffect(() => {
  //   ref.current.scrollIntoView({ behavior: "instant", block: "nearest" })
  // }, [])

  // const [{ x, y }, api] = useSpring(() => ({
  //   x: 0,
  //   y: 0
  // }))

  // const bind = useDrag(
  //   ({ down, offset: [x, y] }) => {
  //     api.start({ x, y })
  //     if (!down) {
  //       setCursor("grab")
  //     } else if (cursor === "grab") {
  //       setCursor("grabbing")
  //     }
  //   },
  //   {
  //     // bounds: {
  //     //   left: 200,
  //     //   top: 200,
  //     //   right: 200,
  //     //   bottom: 200
  //     // }
  //     // from: () => [x.get(), y.get()]
  //   }
  // )

  return (
    <div
      // style={{
      //   x,
      //   y,
      //   cursor
      // }}
      // {...bind()}
      className="bg-slate-800 absolute w-[2000px] h-[2000px] select-none"
    >
      {/* <div className="absolute w-full h-full"> */}
      {/* <div
          ref={ref}
          className="w-64 h-64 relative bg-green-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        > */}
      {blocks.map(block => {
        if (block.type === "set") {
          return <SetBlock block_={block} key={block.id} />
        } else if (block.type === "if") {
          return <IfBlock block_={block} key={block.id} />
        } else if (block.type === "start") {
          return <StartBlock block_={block} key={block.id} />
        } else if (block.type === "end") {
          return <EndBlock block_={block} key={block.id} />
        }
      })}
      {/* </div>
      </div> */}
    </div>
  )
}
