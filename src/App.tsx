import { useEffect } from "react"
import Blocks from "./Blocks/Blocks"
import Sidebar from "./components/Sidebar"
import useBlockStore from "./store/useBlockStore"
import Notification from "./components/Notification"

export default function App() {
  // Close the notification
  function close() {
    useBlockStore.setState({
      notification: { ...useBlockStore.getState().notification, show: false }
    })
  }

  // Keyboard shortcuts
  useEffect(() => {
    document.addEventListener("keydown", e => {
      if (e.ctrlKey && e.key === "s") {
        // Save blocks
        useBlockStore.setState({
          notification: {
            message: "Do you want to save your program?",
            show: true,
            type: "info",
            yes: {
              text: "Yes",
              onClick: () => {
                useBlockStore.getState().saveBlocks()
                close()
              }
            },
            no: {
              text: "No",
              onClick: close
            }
          }
        })
        e.preventDefault()
      } else if (e.ctrlKey && e.key === "d") {
        // Load blocks
        useBlockStore.setState({
          notification: {
            message: "Do you want to load your program?",
            show: true,
            type: "info",
            yes: {
              text: "Yes",
              onClick: () => {
                useBlockStore.getState().loadBlocks()
                close()
              }
            },
            no: {
              text: "No",
              onClick: close
            }
          }
        })
      } else if (e.ctrlKey && e.key === "f") {
        useBlockStore.getState().runProgram()
      }
    })
  }, [])

  return (
    <>
      <Blocks />
      <Sidebar />
      <Notification />
    </>
  )
}
