export default function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const { children, ...rest } = props
  return (
    <button
      {...rest}
      className="w-full transition-all bg-teal-500 hover:bg-teal-200 hover:text-black p-2 rounded-md text-white"
    >
      {children}
    </button>
  )
}
