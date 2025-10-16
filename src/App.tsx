import React, { useState, useMemo } from "react"
import { quote, Input as QuoteInput, Accessories, BagType } from "./lib/calc"

/** ========= 材料库 ========= */
const MATERIAL_OPTIONS = [
  // PET系列
  { name: "PET-12μm", type: "plastic", density: 1.4, thickness: 12, pricePerKg: 8 },
  { name: "PET-15μm", type: "plastic", density: 1.4, thickness: 15, pricePerKg: 8.2 },
  { name: "VMPET-12μm", type: "plastic", density: 1.4, thickness: 12, pricePerKg: 9 },
  { name: "VMPET-15μm", type: "plastic", density: 1.4, thickness: 15, pricePerKg: 9.2 },

  // BOPP系列
  { name: "BOPP-20μm", type: "plastic", density: 0.91, thickness: 20, pricePerKg: 8.5 },
  { name: "BOPP-25μm", type: "plastic", density: 0.91, thickness: 25, pricePerKg: 8.8 },
  { name: "BOPP-30μm", type: "plastic", density: 0.91, thickness: 30, pricePerKg: 9.1 },

  // CPP系列
  { name: "CPP-25μm", type: "plastic", density: 0.91, thickness: 25, pricePerKg: 9 },
  { name: "CPP-30μm", type: "plastic", density: 0.91, thickness: 30, pricePerKg: 9.2 },
  { name: "CPP-40μm", type: "plastic", density: 0.91, thickness: 40, pricePerKg: 9.5 },
  { name: "VMCPP-30μm", type: "plastic", density: 0.91, thickness: 30, pricePerKg: 11 },

  // PE系列
  { name: "PE-30μm", type: "plastic", density: 0.92, thickness: 30, pricePerKg: 9.2 },
  { name: "PE-40μm", type: "plastic", density: 0.92, thickness: 40, pricePerKg: 9.5 },
  { name: "PE-50μm", type: "plastic", density: 0.92, thickness: 50, pricePerKg: 9.8 },
  { name: "PE-90μm", type: "plastic", density: 0.92, thickness: 90, pricePerKg: 10.16 },

  // BOPA系列
  { name: "BOPA-15μm", type: "plastic", density: 1.16, thickness: 15, pricePerKg: 17 },
  { name: "BOPA-20μm", type: "plastic", density: 1.16, thickness: 20, pricePerKg: 17.5 },

  // 纸类
  { name: "牛皮纸-60g", type: "paper", density: 6.0, thickness: 10, pricePerKg: 7 },
  { name: "牛皮纸-80g", type: "paper", density: 8.0, thickness: 10, pricePerKg: 7.2 },
  { name: "白牛皮纸-60g", type: "paper", density: 6.0, thickness: 10, pricePerKg: 8 },
  { name: "白牛皮纸-80g", type: "paper", density: 8.0, thickness: 10, pricePerKg: 8.2 },
  { name: "棉纸-19g", type: "paper", density: 1.9, thickness: 10, pricePerKg: 11 },
] as const

interface Layer {
  id: number
  materialKey: string
  customName?: string
  customThicknessUm?: number
  customDensity?: number
  customPricePerKg?: number
}

/** ========= 主组件 ========= */
export default function App() {
  // ======= 输入参数 =======
  const [bagType, setBagType] = useState<BagType>("三边封")
  const [W, setW] = useState(100)
  const [H, setH] = useState(150)
  const [G, setG] = useState(0)
  const [SealBack, setSealBack] = useState(10)
  const [Q, setQ] = useState(1000)
  const [SUK, setSUK] = useState(1)
  const [taxRate, setTaxRate] = useState(0.13)
  const [acc, setAcc] = useState<Accessories>({
    普通拉链: false,
    易撕拉链: false,
    气阀: false,
    吸嘴: false,
    手挽: false,
    锡条: null,
  })

  // ======= 材料层 =======
  const [layers, setLayers] = useState<Layer[]>([{ id: 1, materialKey: "" }])
  const addLayer = () => setLayers([...layers, { id: Date.now(), materialKey: "" }])
  const removeLayer = (i: number) => setLayers(layers.filter((_, idx) => idx !== i))
  const updateLayer = (i: number, updates: Partial<Layer>) => {
    const copy = [...layers]
    copy[i] = { ...copy[i], ...updates }
    setLayers(copy)
  }

  // ======= 材料自动计算 =======
  const materialInfo = useMemo(() => {
    let totalT = 0
    let totalCost = 0
    let weightedD = 0
    layers.forEach((l) => {
      const m = MATERIAL_OPTIONS.find((mm) => mm.name === l.materialKey)
      const t = l.customThicknessUm ?? (m as any)?.thickness ?? 0
      const d = l.customDensity ?? (m as any)?.density ?? 1
      const p = l.customPricePerKg ?? (m as any)?.pricePerKg ?? 0
      totalT += t
      totalCost += p * d * (t / 1000)
      weightedD += d * (t / 1000)
    })
    const avgDensity = totalT > 0 ? weightedD / (totalT / 1000) : 0
    const costPerSqm = totalCost
    const computedMaterialPrice = avgDensity > 0 ? totalCost / (avgDensity * totalT / 1000) : 0
    return { totalThickness: totalT, avgDensity, costPerSqm, computedMaterialPrice }
  }, [layers])

  // ======= 报价调用 =======
  const data: QuoteInput = {
    bagType,
    W,
    H,
    G,
    SealBack,
    SideExpand: 0,
    material: layers.map((l) => l.materialKey || "自定义").join("/"),
    materialPricePerKg: materialInfo.computedMaterialPrice || 0,
    thickness: materialInfo.totalThickness || 0,
    density: materialInfo.avgDensity || 1,
    Q,
    SUK,
    taxRate,
    accessories: acc,
    special: { 条型窗: false, 局部UV: false, 异形袋工艺: false, 模具费大于5000: false },
  }

  const result = useMemo(() => quote(data), [JSON.stringify(data)])

  // ======= UI =======
  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 text-gray-800 font-sans">
      <h1 className="text-2xl font-bold text-center mb-6">包装袋自动报价系统</h1>

      {/* 输入区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* 左侧：输入参数 */}
        <div className="border rounded-xl bg-white shadow-sm p-4">
          <h2 className="font-semibold text-gray-800 border-b pb-1 mb-3 text-base">输入参数</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <label>袋型：
              <select className="border rounded p-1.5 w-full"
                value={bagType}
                onChange={(e) => setBagType(e.target.value as BagType)}>
                {["三边封", "自立袋", "中封袋", "风琴袋", "八边封", "异形袋"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>数量Q：
              <input type="number" className="border rounded p-1.5 w-full"
                value={Q} onChange={(e) => setQ(+e.target.value)} />
            </label>
            <label>款数SUK：
              <input type="number" className="border rounded p-1.5 w-full"
                value={SUK} onChange={(e) => setSUK(+e.target.value)} />
            </label>
            <label>税率：
              <input type="number" step="0.01" className="border rounded p-1.5 w-full"
                value={taxRate} onChange={(e) => setTaxRate(+e.target.value)} />
            </label>
            <label>宽(mm)：
              <input type="number" className="border rounded p-1.5 w-full"
                value={W} onChange={(e) => setW(+e.target.value)} />
            </label>
            <label>高(mm)：
              <input type="number" className="border rounded p-1.5 w-full"
                value={H} onChange={(e) => setH(+e.target.value)} />
            </label>
            <label>底插(mm)：
              <input type="number" className="border rounded p-1.5 w-full"
                value={G} onChange={(e) => setG(+e.target.value)} />
            </label>
            <label>封边(mm)：
              <input type="number" className="border rounded p-1.5 w-full"
                value={SealBack} onChange={(e) => setSealBack(+e.target.value)} />
            </label>
          </div>
        </div>

        {/* 右侧：材料结构 */}
        <div className="border rounded-xl bg-white shadow-sm p-4">
          <h2 className="font-semibold text-gray-800 border-b pb-1 mb-3 text-base">材料结构</h2>
          {layers.map((layer, i) => {
            const selected = MATERIAL_OPTIONS.find((m) => m.name === layer.materialKey)
            return (
              <div key={layer.id} className="border rounded-lg p-3 mb-2 bg-gray-50 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <select className="border rounded p-1.5 flex-1"
                    value={layer.materialKey}
                    onChange={(e) => updateLayer(i, { materialKey: e.target.value })}>
                    <option value="">选择材料...</option>
                    {MATERIAL_OPTIONS.map((m) => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                  <button onClick={() => removeLayer(i)} className="text-red-500 hover:text-red-700 text-xs">
                    删除
                  </button>
                </div>
                {layer.materialKey && (
                  <div className="grid grid-cols-3 gap-2">
                    <label className="text-xs text-gray-700">
                      厚度(μm)
                      <input type="number" className="border rounded p-1 w-full mt-1"
                        value={layer.customThicknessUm ?? (selected as any)?.thickness ?? ""}
                        onChange={(e) => updateLayer(i, { customThicknessUm: +e.target.value })} />
                    </label>
                    <label className="text-xs text-gray-700">
                      密度
                      <input type="number" step="0.01" className="border rounded p-1 w-full mt-1"
                        value={layer.customDensity ?? (selected as any)?.density ?? ""}
                        onChange={(e) => updateLayer(i, { customDensity: +e.target.value })} />
                    </label>
                    <label className="text-xs text-gray-700">
                      单价(¥/kg)
                      <input type="number" step="0.1" className="border rounded p-1 w-full mt-1"
                        value={layer.customPricePerKg ?? (selected as any)?.pricePerKg ?? ""}
                        onChange={(e) => updateLayer(i, { customPricePerKg: +e.target.value })} />
                    </label>
                  </div>
                )}
              </div>
            )
          })}

          <button onClick={addLayer} className="mt-2 text-orange-600 text-sm hover:underline">
            + 添加一层
          </button>

          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm">
            <p>📏 总厚度：<b>{materialInfo.totalThickness.toFixed(1)} μm</b></p>
            <p>⚖️ 平均密度：<b>{materialInfo.avgDensity.toFixed(3)}</b></p>
            <p>💰 材料单价（系统计算）：<b>¥ {materialInfo.computedMaterialPrice.toFixed(2)} / kg</b></p>
            <p>🧾 每平米材料成本：<b>¥ {materialInfo.costPerSqm.toFixed(3)}</b></p>
          </div>
        </div>
      </div>

      {/* 报价展示区 */}
      <section className="bg-gradient-to-r from-amber-100 via-orange-100 to-pink-100 border border-indigo-200 rounded-xl p-5 mb-4 shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">报价结果</h2>
        <div className="flex flex-col sm:flex-row justify-around items-center gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-600">单价（含税）</div>
            <div className="text-3xl font-bold text-gray-800">
              ¥ {result.unit_price_cny.toFixed(4)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">总价（含税）</div>
            <div className="text-3xl font-bold text-red-600">
              ¥ {result.total_price_cny.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">数量</div>
            <div className="text-lg font-semibold text-gray-700">{result.quantity} 个</div>
          </div>
        </div>

        <div className="mt-4 text-xs grid grid-cols-3 sm:grid-cols-6 gap-y-1 text-gray-700">
          <div>材料结构: {data.material}</div>
          <div>袋型: {data.bagType}</div>
          <div>厚度: {data.thickness} μm</div>
          <div>密度: {data.density}</div>
          <div>税率: {data.taxRate * 100}%</div>
          <div>款数: {data.SUK}</div>
        </div>
      </section>

      {/* 成本明细 */}
      <section className="border border-gray-200 rounded-lg p-3">
        <h2 className="font-semibold text-base mb-2">成本明细</h2>
        {result.explain.map((e: any, i: number) => (
          <details key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-2"
            {...(e.title === "总价与单价" ? { open: true } : {})}>
            <summary className={`cursor-pointer font-semibold text-sm ${e.title === "总价与单价" ? "text-red-600" : "text-gray-800"}`}>
              {e.title}
            </summary>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap mt-2">{e.text}</pre>
          </details>
        ))}
      </section>
    </div>
  )
}
