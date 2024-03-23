export default function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const { children, ...rest } = props
  return (
    <button
      {...rest}
      className="border w-full bg-teal-500 p-2 rounded-md text-white"
    >
      {children}
    </button>
  )
}
