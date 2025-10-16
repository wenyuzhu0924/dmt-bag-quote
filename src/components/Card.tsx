
import { PropsWithChildren } from 'react'

export default function Card({
  title,
  subtitle,
  children
}: PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 mb-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className="mt-2 space-y-2">
        {children}
      </div>
    </section>
  )
}
