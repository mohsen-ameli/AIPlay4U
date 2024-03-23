import { SpringRef } from "@react-spring/web"

export type Block = {
  id: number
  prev: Block | null
  next: Block | null
  type: "if" | "set" | "end"
  springApi?: SpringRef<{ x: number; y: number }>
  ref?: React.MutableRefObject<HTMLDivElement>
  initialX: number
  initialY: number
  blockDepth: number // how many ifs is this block inside of
  parentIf?: number
}

export type StoreType = {
  blocks: Block[]
  nums: number[]
  moveBlock: (id: number, hoveringId: number) => void
  detachBlock: (id: number) => void
  addBlock: (type: "if" | "set") => void
}
