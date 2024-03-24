import { BLOCK_HEIGHT } from "../data/Constants"
import useBlockStore from "../store/useBlockStore"
import { Block } from "../types/general"
import Button from "./Button"

export default function Sidebar() {
  const blocks = useBlockStore(state => state.blocks)
  const addBlock = useBlockStore(state => state.addBlock)

  function printBlocks() {
    const blocks = useBlockStore.getState().blocks
    for (const block of blocks) {
      console.log(
        `id: ${block.id} prev: ${block.prev?.id} next: ${block.next?.id} depth: ${block.blockDepth}`
      )
      // console.log(block)
    }
    // useBlockStore.setState(state => {
    //   state.nums.push(Math.random())
    //   return state
    // })
  }

  function add(type: "set" | "if") {
    const block: Block = {
      id: blocks.length,
      type,
      prev: null,
      next: null,
      initialX: 200 + (window.innerWidth - 300) * Math.random(),
      initialY: 20 + (window.innerHeight - 100) * Math.random(),
      ref: null!,
      blockDepth: 0
    }

    addBlock(block)

    if (type === "if") {
      const endBlock = structuredClone(block)
      endBlock.id++
      endBlock.initialY += BLOCK_HEIGHT
      endBlock.type = "end"
      addBlock(endBlock)
    }
  }

  // function onClick() {
  //   console.log(window.electron.write("this is a\ntest"))
  //   // ipcRenderer.send("File", "Hello")
  // }

  return (
    <div className="bg-slate-900 h-screen gap-4 flex flex-col items-center p-4 fixed left-0 top-0 z-10">
      <Button onClick={() => add("set")}>Add Set Block</Button>
      <Button onClick={() => add("if")}>Add If Block</Button>
      <Button onClick={printBlocks}>Print All Blocks</Button>
    </div>
  )
}
