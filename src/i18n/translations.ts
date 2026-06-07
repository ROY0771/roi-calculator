import { Language } from '../store/calculatorStore';

export interface Translations {
  // Settings labels
  'Machine Purchase Price': string;
  'Machine Life (Years)': string;
  'Residual Value (%)': string;
  'Insurance (% of purchase / yr)': string;
  'Annual Utilisation (hrs)': string;
  'Labour Cost / hr': string;
  'Other Opex / hr': string;
  'Fuel Input Method': string;
  'Fuel Unit (label only)': string;
  'Fuel Cost / unit': string;
  'Fuel Use / hr': string;
  'Direct Fuel Cost / hr': string;
  'Base Fuel Use / hr @100% load': string;
  'Manual Direct Fuel Cost / hr': string;
  'Service & Maintenance Inputs': string;
  'Service Interval (hrs)': string;
  'Service Cost per event': string;
  'Hydraulic Oil Interval (hrs)': string;
  'Hydraulic Oil Change Cost': string;
  'Damage/Repairs Allowance': string;
  'Selling Price / ton': string;
  'Load Factor': string;
  'Wear Cost / ton': string;
  'Throughput (tph)': string;
  'ROI Model – Crushing & Screening': string;
  'Territory Preset': string;
  'Currency': string;
  'Machine Settings': string;
  'Operation Settings': string;
  
  // ROI Summary labels
  'Annual Throughput (t/yr)': string;
  'Revenue / yr': string;
  'Fuel Cost / yr': string;
  'Wear Cost / yr': string;
  'Labour Cost / yr': string;
  'Other Opex / yr': string;
  'Service & Maintenance / yr': string;
  'Damage/Repairs Allowance / yr': string;
  'Operating Margin / yr': string;
  'Residual Value (end of life)': string;
  'Depreciation / yr': string;
  'Insurance / yr': string;
  'Ownership Cost / yr': string;
  'Net Cashflow / yr (pre-tax)': string;
  'Simple Payback (years)': string;
  'Cash ROI': string;
  'ROI Summary': string;
  'Currency:': string;
  
  // Sensitivity labels
  'Sensitivity Analysis (payback impact)': string;
  'Sensitivity Inputs (% change)': string;
  'TPH +/-': string;
  'Fuel Cost +/-': string;
  'Selling Price +/-': string;
  'Wear Cost +/-': string;
  'Driver': string;
  'Payback (-)': string;
  'Payback (Base)': string;
  'Payback (+)': string;
  'Utilisation (hrs/yr)': string;
  'Fuel Cost (currency/hr)': string;
  'Selling Price (currency/ton)': string;
  'Wear Cost (currency/ton)': string;
  'Base Payback (yrs)': string;
  'Δ yrs (-)': string;
  'Δ yrs (+)': string;
  'Revenue': string;
  
  // Common
  'Settings': string;
  'Download PDF': string;
  'Send to Email': string;
  'Language': string;
  'Territory': string;
  'Hard Rock': string;
  'Limestone': string;
  'Recycle': string;
  'Use/hr & cost/unit': string;
  'Direct cost/hr': string;
}

const zhTranslations: Partial<Translations> = {
  'Machine Purchase Price': '设备购买价格',
  'Machine Life (Years)': '机器使用寿命(年)',
  'Residual Value (%)': '残值率(%)',
  'Insurance (% of purchase / yr)': '保险费率(%购买价/年)',
  'Annual Utilisation (hrs)': '年使用小时数',
  'Labour Cost / hr': '人工成本/小时',
  'Other Opex / hr': '其他运营成本/小时',
  'Fuel Input Method': '燃油输入方式',
  'Fuel Unit (label only)': '燃油单位(标签)',
  'Fuel Cost / unit': '燃油单价',
  'Fuel Use / hr': '实际能耗/小时',
  'Direct Fuel Cost / hr': '直接燃油成本/小时',
  'Base Fuel Use / hr @100% load': '满功率能耗/小时',
  'Manual Direct Fuel Cost / hr': '手动直接燃油成本/小时',
  'Service & Maintenance Inputs': '保养维护输入',
  'Service Interval (hrs)': '保养间隔(小时)',
  'Service Cost per event': '单次保养费用',
  'Hydraulic Oil Interval (hrs)': '液压油更换间隔(小时)',
  'Hydraulic Oil Change Cost': '单次换油费用',
  'Damage/Repairs Allowance': '损坏维修补贴/小时',
  'Selling Price / ton': '售价/吨',
  'Load Factor': '负载系数',
  'Wear Cost / ton': '磨损成本/吨',
  'Throughput (tph)': '处理量(TPH)',
  'ROI Model – Crushing & Screening': 'ROI模型 - 破碎与筛分',
  'Territory Preset': '地区预设',
  'Currency': '货币',
  'Machine Settings': '机器设置',
  'Operation Settings': '运营设置',
  'Annual Throughput (t/yr)': '年产量(t/年)',
  'Revenue / yr': '年收入',
  'Fuel Cost / yr': '年燃油成本',
  'Wear Cost / yr': '年磨损成本',
  'Labour Cost / yr': '年人工成本',
  'Other Opex / yr': '年其他运营成本',
  'Service & Maintenance / yr': '年保养维护成本',
  'Damage/Repairs Allowance / yr': '年损坏维修补贴',
  'Operating Margin / yr': '年经营利润',
  'Residual Value (end of life)': '残值(期末)',
  'Depreciation / yr': '年折旧',
  'Insurance / yr': '年保险',
  'Ownership Cost / yr': '年持有成本',
  'Net Cashflow / yr (pre-tax)': '年净现金流（税前）',
  'Simple Payback (years)': '回本年限(年)',
  'Cash ROI': '现金投资回报率',
  'ROI Summary': 'ROI汇总',
  'Currency:': '货币：',
  'Sensitivity Analysis (payback impact)': '敏感性分析（回本影响）',
  'Sensitivity Inputs (% change)': '敏感性输入（变化百分比）',
  'TPH +/-': '处理量 +/-',
  'Fuel Cost +/-': '燃油成本 +/-',
  'Selling Price +/-': '售价 +/-',
  'Wear Cost +/-': '磨损成本 +/-',
  'Driver': '驱动因素',
  'Payback (-)': '回本(-)',
  'Payback (Base)': '回本(基准)',
  'Payback (+)': '回本(+)',
  'Utilisation (hrs/yr)': '年使用小时数',
  'Fuel Cost (currency/hr)': '燃油成本(币种/小时)',
  'Selling Price (currency/ton)': '售价(币种/吨)',
  'Wear Cost (currency/ton)': '磨损成本(币种/吨)',
  'Base Payback (yrs)': '基准回本(年)',
  'Δ yrs (-)': '差值年(-)',
  'Δ yrs (+)': '差值年(+)',
  'Revenue': '收入',
  'Settings': '设置',
  'Download PDF': '下载PDF',
  'Send to Email': '发送到邮箱',
  'Language': '语言',
  'Territory': '地区',
  'Hard Rock': '硬岩',
  'Limestone': '石灰石',
  'Recycle': '固废回收',
  'Use/hr & cost/unit': '能耗/小时 & 单位成本',
  'Direct cost/hr': '直接成本/小时',
};

export const getTranslation = (key: string, lang: Language): string => {
  if (lang === 'en') {
    return key;
  }
  return zhTranslations[key as keyof typeof zhTranslations] || key;
};
