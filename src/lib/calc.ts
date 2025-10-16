export type BagType = '三边封' | '自立袋' | '中封袋' | '风琴袋' | '八边封' | '异形袋'

export interface Accessories {
  普通拉链?: boolean
  易撕拉链?: boolean
  气阀?: boolean
  吸嘴?: boolean
  手挽?: boolean
  锡条?: string | null
}

export interface Special {
  条型窗?: boolean
  局部UV?: boolean
  异形袋工艺?: boolean
  模具费大于5000?: boolean
}

export interface Input {
  bagType: BagType
  W: number
  H: number
  G: number
  SealBack: number
  SideExpand: number
  material: string
  materialPricePerKg: number
  thickness: number
  density: number
  Q: number
  SUK: number
  taxRate: number
  accessories: Accessories
  special: Special
}

// ------------------------------
// 主计算函数
// ------------------------------
export function quote(input: Input) {
  const {
    bagType, W, H, G, SealBack, SideExpand,
    materialPricePerKg, thickness, density,
    Q, SUK, taxRate, accessories, special
  } = input

  // ---------- Step 1: 展开尺寸 ----------
  let L_exp = 0, W_exp = 0
  switch (bagType) {
    case '三边封':
      L_exp = H * 2 + 40
      W_exp = W + 5
      break
    case '自立袋':
      L_exp = (H + G) * 2 + 40
      W_exp = W + 5
      break
    case '中封袋':
      L_exp = (W + SealBack) * 2 + 20
      W_exp = H + 3
      break
    case '风琴袋':
      L_exp = (W + SealBack + SideExpand) * 2 + 40
      W_exp = H + 3
      break
    case '八边封':
      L_exp = (H + G) * 2 + 60
      W_exp = W + 0.6 * W
      break
    case '异形袋':
      L_exp = H * 2 + 40
      W_exp = (W + 5) * 1.08
      break
  }

  // ---------- Step 2: 排版 ----------
  const N_row = Math.floor(740 / L_exp)
  const N_circ = Math.floor(1120 / W_exp)
  const N_rev = N_row * N_circ

  // ---------- Step 3: 正单与投料 ----------
  const R_order = Q / N_rev
  const L_rev = (N_circ * W_exp) / 1000
  const M_order = R_order * L_rev

  // ---------- Step 4: 损耗 ----------
  const R_loss = SUK * (600 / N_rev) + 100
  const M_loss = R_loss * L_rev
  const M_idle = ((M_order + M_loss) / 1500) * 50
  const M_total = M_order + M_loss + M_idle

  // ---------- Step 5: 材料面积与重量 ----------
  const widthMat = 760
  const area = M_total * (widthMat / 1000)
  const weightKg = area * (thickness / 1000000) * density
  const materialCost = weightKg * materialPricePerKg

  // ---------- Step 6: 印刷成本 ----------
  let printUnitPrice = 4
  if (R_order <= 500) printUnitPrice = 6
  else if (R_order <= 1000) printUnitPrice = 5
  else if (R_order <= 2000) printUnitPrice = 4.5
  else if (R_order <= 5000) printUnitPrice = 4.25
  const printCost = R_order * printUnitPrice + R_loss * 4

  // ---------- Step 7: 制袋成本 ----------
  let bagCost = 0
  const baseValue = (R_order + R_loss)
  if (['三边封', '自立袋'].includes(bagType)) {
    bagCost = 0.25 * L_rev * baseValue * N_row
    if (bagCost < 300) bagCost = 300
  } else if (bagType === '中封袋') {
    bagCost = 0.35 * N_rev * baseValue * N_row
    if (bagCost < 300) bagCost = 300
  } else if (bagType === '风琴袋') {
    bagCost = 0.4 * N_rev * baseValue * N_row
    if (bagCost < 300) bagCost = 300
  } else if (bagType === '八边封') {
    bagCost = M_order
    if (bagCost < 1800) bagCost = 1800
  } else if (bagType === '异形袋') {
    bagCost = 0.25 * L_rev * baseValue * N_row * 1.1
  }

  // ---------- Step 8: 配件成本 ----------
  let accessoriesCost = 0
  const zipLength = (W / 1000) * N_rev * baseValue
  if (accessories.普通拉链) accessoriesCost += zipLength * 0.2
  if (accessories.易撕拉链) accessoriesCost += zipLength * 0.35
  if (accessories.气阀) accessoriesCost += Q * 0.5
  if (accessories.吸嘴) accessoriesCost += Q * 0.5
  if (accessories.手挽) accessoriesCost += Q * 1
  if (accessories.锡条 === '≤140') accessoriesCost += Q * 0.5
  else if (accessories.锡条 === '140-200') accessoriesCost += Q * 0.6
  else if (accessories.锡条 === '200-250') accessoriesCost += Q * 0.7
  else if (accessories.锡条 === '>250') accessoriesCost += Q * 0.8

  // ---------- Step 9: 特殊工艺 ----------
  let specialCost = 0
  if (special.条型窗) specialCost += Q * 0.2 + 300
  if (special.局部UV) specialCost += Q * 0.2 + 500
  if (special.异形袋工艺) specialCost += Q * 0.05 + (Q < 5000 ? 900 : 1200)

  // ---------- Step 10: 汇总 ----------
  const total = materialCost + printCost + bagCost + accessoriesCost + specialCost
  const unit = total / Q
  const unitVAT = unit * (1 + taxRate)

  // ---------- Step 11: 文字说明 ----------
  const explain = [
    {
      title: '材料成本',
      text: `
材料成本由材料面积、厚度、密度与单价决定。
计算公式：材料成本 = 投料面积 × 厚度 × 材料密度 × 材料单价
带入计算：
材料成本 = ${area.toFixed(2)} × ${thickness / 1000000} × ${density} × ${materialPricePerKg} = ${materialCost.toFixed(2)} 元
      `
    },
    {
      title: '印刷成本',
      text: `
印刷成本按印刷转数与单价计算，并包含损耗。
计算公式：印刷成本 = 正单转数 × 单价 + 损耗转数 × 4
带入计算：
印刷成本 = ${R_order.toFixed(1)} × ${printUnitPrice} + ${R_loss.toFixed(1)} × 4 = ${printCost.toFixed(2)} 元
      `
    },
    {
      title: '制袋成本',
      text: `
制袋成本由袋型、投料米数及排版个数决定。
计算公式：制袋成本 = 系数 × 每转长度 × (正单+损耗) × 横排个数
带入计算：
制袋成本 = ${bagCost.toFixed(2)} 元
      `
    },
    {
      title: '配件成本',
      text: `
配件包括拉链、气阀、吸嘴、手挽、锡条等，根据数量计算。
配件成本合计 = ${accessoriesCost.toFixed(2)} 元
      `
    },
    {
      title: '特殊工艺成本',
      text: `
特殊工艺包括条型窗、局部UV、异形袋模具费等。
特殊工艺成本合计 = ${specialCost.toFixed(2)} 元
      `
    },
    {
      title: '总价与单价',
      text: `
总价 = 材料成本 + 印刷成本 + 制袋成本 + 配件成本 + 特殊工艺
带入计算：
总价 = ${total.toFixed(2)} 元
单价 = ${unit.toFixed(4)} 元/个
含税单价（13%）= ${(unitVAT).toFixed(4)} 元/个
      `
    }
  ]

  return {
    quantity: Q,
    unit_price_cny: unit,
    total_price_cny: total,
    debug: {
      L_exp, W_exp, N_row, N_circ, N_rev,
      R_order, R_loss, L_rev, M_total, area, weightKg
    },
    explain
  }
}
