
export default function BottomBar({
  quantity,
  unit,
  total,
  onGenerate
}: {
  quantity: number
  unit: number
  total: number
  onGenerate: () => void
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3">
      <div className="max-w-3xl mx-auto flex items-center gap-3">
        <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
          <div className="bg-bg rounded-lg p-2">
            <div className="text-gray-500 text-xs">数量</div>
            <div className="font-bold">{Number.isFinite(quantity) ? quantity : '-'}</div>
          </div>
          <div className="bg-bg rounded-lg p-2">
            <div className="text-gray-500 text-xs">单价</div>
            <div className="font-bold">{Number.isFinite(unit) ? unit.toFixed(4) + ' 元' : '-'}</div>
          </div>
          <div className="bg-bg rounded-lg p-2">
            <div className="text-gray-500 text-xs">总价</div>
            <div className="font-bold">{Number.isFinite(total) ? total.toFixed(2) + ' 元' : '-'}</div>
          </div>
        </div>
        <button
          onClick={onGenerate}
          className="shrink-0 bg-brand text-white px-4 py-2 rounded-lg font-medium"
        >
          生成报价单
        </button>
      </div>
    </div>
  )
}
