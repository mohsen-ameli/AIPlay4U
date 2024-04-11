import { useState } from "react"
import useBlockStore from "../store/useBlockStore"

export default function Input({
  id,
  inputIdx,
  placeholder
}: {
  id: number
  inputIdx: number
  placeholder: string
}) {
  const [value, setValue] = useState("")

  return (
    <input
      onChange={e => {
        setValue(e.target.value)
        useBlockStore.setState(prev => {
          prev.blocks[id].inputs[inputIdx] = e.target.value
          return prev
        })
      }}
      size={value.length - 1 <= 0 ? 1 : value.length - 1}
      className="max-w-44 min-w-[5.4rem] pl-2"
      placeholder={placeholder}
    />
  )
}
