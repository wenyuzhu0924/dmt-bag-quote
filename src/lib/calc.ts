export type BagType = '三边封' | '自立袋' | '中封袋' | '风琴袋' | '八边封' | '异形袋'

export type Accessories = {
  普通拉链?: boolean
  易撕拉链?: boolean
  气阀?: boolean
  吸嘴?: boolean
  手挽?: boolean
  锡条?: string | null
}

export type Input = {
  bagType: BagType
  W: number
  H: number
  G: number
  SealBack: number
  SideExpand: number
  material: string
  materialPricePerKg?: number
  materialPricePerSqm?: number
  thickness: number
  density: number
  Q: number
  SUK: number
  taxRate: number
  accessories: Accessories
  special: Record<string, boolean>
}

export type QuoteResult = {
  unit_price_cny: number
  total_price_cny: number
  quantity: number
  explain: { title: string, text: string }[]
}

/** ----------------------------
 * 面积计算逻辑
 * ---------------------------- */
function calcArea(bagType: BagType, W: number, H: number, G: number, SealBack: number) {
  let area = 0
  switch (bagType) {
    case '三边封':
      area = (W + SealBack) * (H + SealBack) * 2
      break
    case '自立袋':
      area = (W + SealBack) * (H + G / 2 + SealBack) * 2
      break
    case '中封袋':
      area = (W + SealBack) * (H + SealBack)
      break
    case '风琴袋':
      area = (W + SealBack + G * 2) * (H + SealBack) * 2
      break
    case '八边封':
      area = (W + G * 2 + SealBack) * (H + SealBack) * 2
      break
    default:
      area = (W + SealBack) * (H + SealBack) * 2
  }
  return area / 1_000_000 // 转 m²
}

/** ----------------------------
 * 主报价逻辑（含公式展示）
 * ---------------------------- */
export function quote(data: Input): QuoteResult {
  const {
    bagType, W, H, G, SealBack,
    material, materialPricePerKg = 0, materialPricePerSqm = 0,
    thickness, density, Q, SUK, taxRate, accessories, special
  } = data

  const explain: QuoteResult["explain"] = []

  // 1️⃣ 面积计算
  const area_m2 = calcArea(bagType, W, H, G, SealBack)
  explain.push({
    title: "面积计算",
    text: `公式：面积 = (宽 + 封边) × (高 + 底插/2 + 封边) × 2 ÷ 1,000,000\n` +
      `带入：(${W} + ${SealBack}) × (${H} + ${G}/2 + ${SealBack}) × 2 ÷ 1,000,000 = ${area_m2.toFixed(4)} m²`
  })

  // 2️⃣ 材料成本（优先使用平方米单价）
  let materialCostPerBag = 0
  if (materialPricePerSqm > 0) {
    materialCostPerBag = area_m2 * materialPricePerSqm
    explain.push({
      title: "材料成本（按㎡计价）",
      text:
        `公式：材料成本 = 面积 × 单价(元/㎡)\n` +
        `带入：${area_m2.toFixed(4)} × ${materialPricePerSqm.toFixed(4)} = ${materialCostPerBag.toFixed(4)} 元`
    })
  } else {
    // 兼容旧算法
    const volume = area_m2 * (thickness / 1_000_000) // m³
    const weight_kg = volume * density * 1_000
    materialCostPerBag = weight_kg * materialPricePerKg
    explain.push({
      title: "材料成本（按kg计价）",
      text:
        `公式：材料成本 = 面积 × 厚度 × 密度 × 单价(元/kg)\n` +
        `带入：${area_m2.toFixed(4)} × ${thickness}/1,000,000 × ${density} × ${materialPricePerKg} = ${materialCostPerBag.toFixed(4)} 元`
    })
  }

  // 3️⃣ 其他工艺成本（示例）
  const processingCost = 0.03
  const printingCost = 0.05
  const laminationCost = 0.02
  const machineCost = 0.01
  const plateCost = 0.01
  const accessoryCost = Object.values(accessories).filter(v => v).length * 0.02
  const specialCost = Object.values(special).filter(v => v).length * 0.01

  const otherCost =
    processingCost + printingCost + laminationCost + machineCost + plateCost + accessoryCost + specialCost

  explain.push({
    title: "加工与附加成本",
    text:
      `加工费固定值：${processingCost.toFixed(2)} 元\n` +
      `印刷费：${printingCost.toFixed(2)} 元\n` +
      `复合费：${laminationCost.toFixed(2)} 元\n` +
      `上机费：${machineCost.toFixed(2)} 元\n` +
      `版费：${plateCost.toFixed(2)} 元\n` +
      `配件费 = 配件数量 × 0.02 = ${Object.values(accessories).filter(v => v).length} × 0.02 = ${accessoryCost.toFixed(2)} 元\n` +
      `特殊工艺费 = 特殊工艺数量 × 0.01 = ${Object.values(special).filter(v => v).length} × 0.01 = ${specialCost.toFixed(2)} 元\n` +
      `合计其他成本 = ${otherCost.toFixed(4)} 元`
  })

  // 4️⃣ 单价与总价
  const unit_price_before_tax = materialCostPerBag + otherCost
  const unit_price_cny = unit_price_before_tax * (1 + taxRate)
  const total_price_cny = unit_price_cny * Q * SUK

  explain.push({
    title: "总价与单价",
    text:
      `单价（含税） = (材料成本 + 其他成本) × (1 + 税率)\n` +
      `带入：(${materialCostPerBag.toFixed(4)} + ${otherCost.toFixed(4)}) × (1 + ${taxRate}) = ${unit_price_cny.toFixed(4)} 元\n\n` +
      `总价（含税） = 单价 × 数量 × 款数\n` +
      `带入：${unit_price_cny.toFixed(4)} × ${Q} × ${SUK} = ${total_price_cny.toFixed(2)} 元`
  })

  return {
    unit_price_cny,
    total_price_cny,
    quantity: Q,
    explain
  }
}
