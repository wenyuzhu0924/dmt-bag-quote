
type Props = {
  label: string
  value?: string | number
  onChange?: (v: string) => void
  placeholder?: string
  type?: string
  step?: string
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  step
}: Props) {
  return (
    <label className="block text-sm">
      <span className="text-gray-700">{label}</span>
      <input
        className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        value={value as any}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        type={type}
        step={step}
      />
    </label>
  )
}
