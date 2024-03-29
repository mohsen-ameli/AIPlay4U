import { SpringRef } from "@react-spring/web"

export type Block = {
  id: number
  prev: Block | null
  next: Block | null
  type: "if" | "set" | "end" | "start"
  springApi?: SpringRef<{ x: number; y: number }>
  ref?: React.MutableRefObject<HTMLDivElement>
  initialX: number
  initialY: number
  blockDepth: number // how many ifs is this block inside of
  parentIf?: number
  inputs: string[]
}

export type StoreType = {
  blocks: Block[]
  moveBlock: (id: number, hoveringId: number) => void
  detachBlock: (id: number) => void
  runProgram: () => void
  addBlock: (block: Block) => void
  saveBlocks: () => void
  loadBlocks: () => void
}
