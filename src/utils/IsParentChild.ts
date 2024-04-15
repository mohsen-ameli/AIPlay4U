import { BlockType } from "../types/general";

export function isParentChild(type: BlockType) {
  if (type === "if" || type === "for" || type === "while") {
    return true
  }
  return false
}