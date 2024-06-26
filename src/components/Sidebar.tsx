import * as c from "../data/Colors"
import { BLOCK_HEIGHT } from "../data/Constants"
import useBlockStore from "../store/useBlockStore"
import { Block, BlockType } from "../types/general"
import { isParentChild } from "../utils/IsParentChild"
import Button from "./Button"

export default function Sidebar() {
  const blocks = useBlockStore(state => state.blocks)
  const addBlock = useBlockStore(state => state.addBlock)

  // function printBlocks() {
  //   const blocks = useBlockStore.getState().blocks
  //   for (const block of blocks) {
  //     // console.log(`id: ${block.id} inputs: ${block.inputs}`)
  //     console.log(block)
  //   }
  // }

  function add(type: BlockType) {
    let color = ""

    switch (type) {
      case "if":
        color = c.ifColor
        break
      case "for":
        color = c.forColor
        break
      case "print":
        color = c.printColor
        break
      case "set":
        color = c.setColor
        break
      case "start":
        color = c.startColor
        break
      case "while":
        color = c.whileColor
        break
      default:
        break
    }

    const block: Block = {
      id: blocks.length,
      type,
      prev: null,
      next: null,
      color,
      initialX: 200 + (window.innerWidth - 300) * Math.random(),
      initialY: 20 + (window.innerHeight - 100) * Math.random(),
      ref: null!,
      blockDepth: 0,
      inputs: []
    }

    addBlock(block)

    if (isParentChild(type)) {
      const endBlock = structuredClone(block)
      endBlock.id++
      endBlock.initialY += BLOCK_HEIGHT
      endBlock.type = "end"
      addBlock(endBlock)
    }
  }

  // function onClick() {
  //   Notification.requestPermission().then(permission => {
  //     if (permission === "granted") {
  //       new Notification("Hello World", {
  //         body: "This is a test notification",
  //         icon: "https://avatars.githubusercontent.com/u/55251014?v=4"
  //         // requireInteraction: true,
  //       })
  //     }
  //   })
  // }

  return (
    <div className="bg-slate-900 h-screen gap-4 flex flex-col items-center p-4 fixed left-0 top-0 z-10">
      <Button onClick={() => add("set")}>Add Set Block</Button>
      <Button onClick={() => add("if")}>Add If Block</Button>
      <Button onClick={() => add("print")}>Add Print Block</Button>
      <Button onClick={() => add("for")}>Add For Block</Button>
      <Button onClick={() => add("while")}>Add While Block</Button>
      {/* <Button onClick={printBlocks}>Print All Blocks</Button> */}
      {/* <Button onClick={runProgram}>Run Program</Button>
      <Button onClick={saveBlocks}>Save File</Button>
      <Button onClick={loadBlocks}>Load File</Button> */}
      {/* <Button onClick={onClick}>Test</Button> */}
    </div>
  )
}
