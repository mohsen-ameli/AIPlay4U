import Button from "../components/Button"
import useBlockStore from "../store/useBlockStore"
import SetBlock from "./SetBlock"
import IfBlock from "./IfBlock"
import EndBlock from "./EndBlock"

export default function Blocks() {
  const blocks = useBlockStore(state => state.blocks)
  // const nums = useBlockStore(state => state.nums)
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

  return (
    <div className="bg-slate-800 w-screen h-screen select-none flex">
      <div className="bg-slate-900 h-screen gap-4 flex flex-col items-center p-4">
        <Button onClick={() => addBlock("set")}>Add Set Block</Button>
        <Button onClick={() => addBlock("if")}>Add If Block</Button>
        <Button onClick={printBlocks}>Print All Blocks</Button>
      </div>

      {/* <div className="text-white">{JSON.stringify(nums)}</div> */}

      <div>
        {blocks.map(block => {
          if (block.type === "set") {
            return <SetBlock block_={block} key={block.id} />
          } else if (block.type === "if") {
            return <IfBlock block_={block} key={block.id} />
          } else {
            return <EndBlock block_={block} key={block.id} />
          }
        })}
      </div>
    </div>
  )
}
