import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDownload, faPlay } from "@fortawesome/fontawesome-free-solid"
import fontawesome from "@fortawesome/fontawesome"
import useBlockStore from "../store/useBlockStore"
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons"

fontawesome.library.add(faPlay, faFloppyDisk, faDownload)

export default function Navbar() {
  const runProgram = useBlockStore(state => state.runProgram)
  const saveBlocks = useBlockStore(state => state.saveBlocks)
  const loadBlocks = useBlockStore(state => state.loadBlocks)

  return (
    <div className="fixed p-2 top-0 w-full gap-4 bg-slate-900 flex justify-end text-white">
      <button className="p-2 text-[20pt]" onClick={saveBlocks}>
        <FontAwesomeIcon icon="floppy-disk" />
      </button>

      <button className="p-2 text-[20pt]" onClick={loadBlocks}>
        <FontAwesomeIcon icon="download" />
      </button>
      <button className="p-2 text-[20pt]" onClick={runProgram}>
        <FontAwesomeIcon icon="play" />
      </button>
    </div>
  )
}
