import { SpringRef } from "@react-spring/web"

export type Block = {
  id: number
  prev: Block | null
  next: Block | null
  type: "if" | "set" | "end" | "start" | "print"
  springApi?: SpringRef<{ x: number; y: number }>
  ref?: React.MutableRefObject<HTMLDivElement>
  initialX: number
  initialY: number
  blockDepth: number // how many ifs is this block inside of
  parentIf?: number
  inputs: (string | number)[]
}

export type StoreType = {
  blocks: Block[]
  moveBlock: (id: number, hoveringId: number) => void
  detachBlock: (id: number) => void
  runProgram: () => void
  addBlock: (block: Block) => void
  saveBlocks: () => void
  loadBlocks: () => void
  notification: {
    message: string
    show: boolean
    type: "success" | "error" | "warning" | "info"
    yes?: {
      text: string
      onClick: () => void
    }
    no?: {
      text: string
      onClick: () => void
    }
  }
}
