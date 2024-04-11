import useBlockStore from "../store/useBlockStore"
import Button from "./Button"

export default function Notification() {
  const notif = useBlockStore(state => state.notification)

  if (!notif.show) return <></>

  return (
    <div className="bg-[#00000084] z-20 text-white absolute top-0 left-0 h-screen w-screen flex items-center justify-center">
      <div className="flex flex-col justify-between h-[150px] bg-[#17623b] p-8 rounded-lg">
        <h1 className="text-xl">{notif.message}</h1>
        <div className="flex gap-2">
          {notif.yes && (
            <Button onClick={notif.yes.onClick}>{notif.yes.text}</Button>
          )}
          {notif.no && (
            <Button onClick={notif.no.onClick}>{notif.no.text}</Button>
          )}
        </div>
      </div>
    </div>
  )
}
