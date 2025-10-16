import { useState, useMemo, useEffect } from "react"
import { quote, Input as QuoteInput, Accessories, BagType } from './lib/calc'

type MaterialOption = {
  name: string
  layers: string[]
  defaultThickness: number
  defaultPricePerSqm: number
  note?: string
}

// 🔧 固定材料选项（红框内）
const MATERIAL_OPTIONS: MaterialOption[] = [
  {
    name: "牛皮纸+高阻隔PLA",
    layers: ["70gsm牛皮纸", "50μm高阻隔PLA"],
    defaultThickness: 120,
    defaultPricePerSqm: 0.32,
  },
  {
    name: "牛皮纸+镀铝PLA+PLA",
    layers: ["80gsm牛皮纸", "15μm镀铝PLA", "50μmPLA"],
    defaultThickness: 135,
    defaultPricePerSqm: 0.35,
  },
  {
    name: "PE+VMPET+PE（for咖啡、食品）",
    layers: ["50μmMatte PE", "40μmVMPET", "40μmPE"],
    defaultThickness: 130,
    defaultPricePerSqm: 0.28,
  },
  {
    name: "PE+涂A PE（for咖啡、食品）",
    layers: ["50μmMatte PE", "40μmPE", "40μm涂A PE"],
    defaultThickness: 130,
    defaultPricePerSqm: 0.27,
  },
  {
    name: "OPP+VMPET+PE（通用）",
    layers: ["40μmOPP", "12μmVMPET", "70μmPE"],
    defaultThickness: 122,
    defaultPricePerSqm: 0.26,
  },
  {
    name: "OPP+PET+AL+PE（通用）",
    layers: ["40μmOPP", "12μmPET", "7μmAL", "60μmPE"],
    defaultThickness: 120,
    defaultPricePerSqm: 0.30,
  },
]

export default function App() {
  // 参数
  const [bagType, setBagType] = useState<BagType>('三边封')
  const [W, setW] = useState(100)
  const [H, setH] = useState(150)
  const [G, setG] = useState(0)
  const [SealBack, setSealBack] = useState(10)
  const [SideExpand, setSideExpand] = useState(0)

  // 材料选项
  const [materialOption, setMaterialOption] = useState<MaterialOption>(MATERIAL_OPTIONS[0])
  const [material, setMaterial] = useState(MATERIAL_OPTIONS[0].name)
  const [thickness, setThickness] = useState(MATERIAL_OPTIONS[0].defaultThickness)
  const [density, setDensity] = useState(1.1)
  const [materialPricePerSqm, setMaterialPricePerSqm] = useState(MATERIAL_OPTIONS[0].defaultPricePerSqm)

  const [Q, setQ] = useState(1000)
  const [SUK, setSUK] = useState(1)
  const [taxRate, setTaxRate] = useState(0.13)

  const [acc, setAcc] = useState<Accessories>({
    普通拉链: false, 易撕拉链: false, 气阀: false, 吸嘴: false, 手挽: false, 锡条: null
  })
  const [special, setSpecial] = useState({
    条型窗: false, 局部UV: false, 异形袋工艺: false, 模具费大于5000: false
  })

  // ✅ 切换材料时更新默认厚度与单价
  const handleMaterialChange = (name: string) => {
    const selected = MATERIAL_OPTIONS.find(m => m.name === name)!
    setMaterialOption(selected)
    setMaterial(selected.name)
    setThickness(selected.defaultThickness)
    setMaterialPricePerSqm(selected.defaultPricePerSqm)
  }

  // ✅ 厚度改变时，自动调整材料单价（线性比例）
  useEffect(() => {
    if (!materialOption) return
    const ratio = thickness / materialOption.defaultThickness
    const adjustedPrice = materialOption.defaultPricePerSqm * ratio
    setMaterialPricePerSqm(parseFloat(adjustedPrice.toFixed(4)))
  }, [thickness])

  // 计算逻辑
  const data: QuoteInput = {
    bagType, W, H, G, SealBack, SideExpand,
    material,
    materialPricePerSqm,
    thickness, density,
    Q, SUK, taxRate, accessories: acc, special
  }

  const result = useMemo(() => quote(data), [JSON.stringify(data)])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 font-sans text-gray-800 text-sm">
      <h1 className="text-xl font-bold text-center mb-5">包装袋自动报价系统</h1>

      {/* 参数区 */}
      <section className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
        <h2 className="font-semibold text-base mb-3 border-b pb-1">输入参数</h2>

        <div className="grid grid-cols-2 gap-3">
          {/* 尺寸 */}
          <div>
            <h3 className="text-sm font-semibold mb-1">袋型与尺寸</h3>
            <label className="block mb-1">
              袋型：
              <select className="border rounded p-1 ml-1 text-sm" value={bagType} onChange={e => setBagType(e.target.value as BagType)}>
                {['三边封', '自立袋', '中封袋', '风琴袋', '八边封', '异形袋'].map(t =>
                  <option key={t} value={t}>{t}</option>
                )}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-1">
              <label>宽(mm)：<input type="number" value={W} onChange={e => setW(+e.target.value)} className="border w-20 p-1 rounded text-sm" /></label>
              <label>高(mm)：<input type="number" value={H} onChange={e => setH(+e.target.value)} className="border w-20 p-1 rounded text-sm" /></label>
              <label>底插(mm)：<input type="number" value={G} onChange={e => setG(+e.target.value)} className="border w-20 p-1 rounded text-sm" /></label>
              <label>封边(mm)：<input type="number" value={SealBack} onChange={e => setSealBack(+e.target.value)} className="border w-20 p-1 rounded text-sm" /></label>
            </div>
          </div>

          {/* 材料结构 */}
          <div>
            <h3 className="text-sm font-semibold mb-1">材料结构</h3>
            <label className="block mb-1">
              结构：
              <select
                className="border rounded p-1 ml-1 text-sm w-52"
                value={material}
                onChange={e => handleMaterialChange(e.target.value)}
              >
                {MATERIAL_OPTIONS.map(opt => (
                  <option key={opt.name} value={opt.name}>{opt.name}</option>
                ))}
              </select>
            </label>

            <div className="text-xs text-gray-600 mb-1">
              层结构：{materialOption.layers.join(' + ')}
            </div>

            <div className="grid grid-cols-2 gap-1">
              <label>厚度(μm)：<input type="number" value={thickness} onChange={e => setThickness(+e.target.value)} className="border w-20 p-1 rounded text-sm" /></label>
              <label>密度(g/cm³)：<input type="number" value={density} onChange={e => setDensity(+e.target.value)} className="border w-20 p-1 rounded text-sm" /></label>
              <label>单价(元/㎡)：<input type="number" value={materialPricePerSqm} onChange={e => setMaterialPricePerSqm(+e.target.value)} className="border w-20 p-1 rounded text-sm" /></label>
            </div>
          </div>
        </div>

        {/* 数量与税率 */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <label>数量Q：<input type="number" value={Q} onChange={e => setQ(+e.target.value)} className="border w-24 p-1 rounded text-sm" /></label>
          <label>款数SUK：<input type="number" value={SUK} onChange={e => setSUK(+e.target.value)} className="border w-24 p-1 rounded text-sm" /></label>
          <label>税率：<input type="number" step="0.01" value={taxRate} onChange={e => setTaxRate(+e.target.value)} className="border w-20 p-1 rounded text-sm" /></label>
        </div>

        {/* 配件与工艺保持不变 */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['普通拉链', '易撕拉链', '气阀', '吸嘴', '手挽'].map(k => (
            <label key={k} className="flex items-center gap-1">
              <input type="checkbox" checked={(acc as any)[k]} onChange={e => setAcc({ ...acc, [k]: e.target.checked })} />
              <span>{k}</span>
            </label>
          ))}
        </div>

        <label className="block mt-2">
          锡条长度：
          <select className="border rounded p-1 ml-1 text-sm" value={acc.锡条 ?? ''} onChange={e => setAcc({ ...acc, 锡条: (e.target.value || null) as any })}>
            <option value="">不选</option>
            <option value="≤140">≤140mm</option>
            <option value="140-200">140–200mm</option>
            <option value="200-250">200–250mm</option>
            <option value=">250">250mm</option>
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2 mt-2">
          {['条型窗', '局部UV', '异形袋工艺', '模具费大于5000'].map(k => (
            <label key={k} className="flex items-center gap-1">
              <input type="checkbox" checked={(special as any)[k]} onChange={e => setSpecial({ ...special, [k]: e.target.checked })} />
              <span>{k}</span>
            </label>
          ))}
        </div>
      </section>

      {/* 报价结果 */}
      <section className="bg-gradient-to-r from-amber-100 via-orange-100 to-pink-100 border border-indigo-200 rounded-xl p-5 mb-4 shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">报价结果</h2>
        <div className="flex flex-col sm:flex-row justify-around items-center gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-600">单价（含税）</div>
            <div className="text-3xl font-bold text-gray-800">¥ {result.unit_price_cny.toFixed(4)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">总价（含税）</div>
            <div className="text-3xl font-bold text-red-600">¥ {result.total_price_cny.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">数量</div>
            <div className="text-lg font-semibold text-gray-700">{result.quantity} 个</div>
          </div>
        </div>
      </section>

      {/* 成本明细 */}
      <section className="border border-gray-200 rounded-lg p-3">
        <h2 className="font-semibold text-base mb-2">成本明细</h2>
        {result.explain.map((e, i) => (
          <details key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-2" {...(e.title === '总价与单价' ? { open: true } : {})}>
            <summary className={`cursor-pointer font-semibold text-sm ${e.title === '总价与单价' ? 'text-red-600' : 'text-gray-800'}`}>{e.title}</summary>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap mt-2">{e.text}</pre>
          </details>
        ))}
      </section>
    </div>
  )
}
