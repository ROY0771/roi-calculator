import React, { useMemo, useState } from 'react';
import { useCalculatorStore, Currency, FuelMethod, FuelUnit, Territory } from '../store/calculatorStore';
import { getTranslation } from '../i18n/translations';
import { Settings, DollarSign, TrendingUp, Download, Mail } from 'lucide-react';

interface CalculatorProps {
  onExportPDF: () => void;
  onSendEmail: () => void;
}

const Calculator: React.FC<CalculatorProps> = ({ onExportPDF, onSendEmail }) => {
  const store = useCalculatorStore();
  const {
    language, currency, territory,
    sellingPrice, loadFactor, wearCost, tph,
    purchasePrice, machineLife, residualValue, insuranceRate,
    annualHours, labourCost, otherOpex,
    fuelMethod, fuelUnit, fuelCostPerUnit, baseFuelUse, manualDirectFuelCost,
    serviceInterval, serviceCost, hydraulicInterval, hydraulicCost,
    setTerritory, setCurrency, setSellingPrice, setLoadFactor, setWearCost, setTph,
    setPurchasePrice, setMachineLife, setResidualValue, setInsuranceRate,
    setAnnualHours, setLabourCost, setOtherOpex,
    setFuelMethod, setFuelUnit, setFuelCostPerUnit, setBaseFuelUse, setManualDirectFuelCost,
    setServiceInterval, setServiceCost, setHydraulicInterval, setHydraulicCost,
    setLanguage,
  } = store;

  const t = (key: string) => getTranslation(key, language);
  const sym = currency;
  const [activeTab, setActiveTab] = useState<'settings' | 'roi' | 'sensitivity'>('settings');

  // ===== Settings computed values =====
  // B17 = BaseFuelUse * LoadFactor (actual fuel use/hr)
  const actualFuelUse = useMemo(() => baseFuelUse * loadFactor, [baseFuelUse, loadFactor]);
  // B18 = IF fuelMethod="Direct cost/hr" THEN B20 ELSE B17*fuelCostPerUnit
  const fuelCostPerHr = useMemo(() => {
    if (fuelMethod === 'Direct cost/hr') return manualDirectFuelCost;
    return actualFuelUse * fuelCostPerUnit;
  }, [fuelMethod, manualDirectFuelCost, actualFuelUse, fuelCostPerUnit]);
  // B26 = (purchasePrice/machineLife/annualHours) * 0.1
  const damageAllowancePerHr = useMemo(() => (purchasePrice / machineLife / annualHours) * 0.1, [purchasePrice, machineLife, annualHours]);

  // ===== ROI Summary computed values =====
  // B4 = tph * annualHours
  const annualThroughput = useMemo(() => tph * annualHours, [tph, annualHours]);
  // B5 = B4 * sellingPrice (NO load factor!)
  const annualRevenue = useMemo(() => annualThroughput * sellingPrice, [annualThroughput, sellingPrice]);
  // B6 = (annualHours * actualFuelUse) * fuelCostPerUnit
  const annualFuelCost = useMemo(() => annualHours * actualFuelUse * fuelCostPerUnit, [annualHours, actualFuelUse, fuelCostPerUnit]);
  // B7 = B4 * wearCost
  const annualWearCost = useMemo(() => annualThroughput * wearCost, [annualThroughput, wearCost]);
  // B8 = labourCost * annualHours
  const annualLabourCost = useMemo(() => labourCost * annualHours, [labourCost, annualHours]);
  // B9 = otherOpex * annualHours
  const annualOtherOpex = useMemo(() => otherOpex * annualHours, [otherOpex, annualHours]);
  // B10 = CEILING(annualHours/serviceInterval,1)*serviceCost + CEILING(annualHours/hydraulicInterval,1)*hydraulicCost
  const annualServiceMaintenance = useMemo(() => {
    return Math.ceil(annualHours / serviceInterval) * serviceCost
      + Math.ceil(annualHours / hydraulicInterval) * hydraulicCost;
  }, [annualHours, serviceInterval, serviceCost, hydraulicInterval, hydraulicCost]);
  // B11 = annualHours * damageAllowancePerHr
  const annualDamageAllowance = useMemo(() => annualHours * damageAllowancePerHr, [annualHours, damageAllowancePerHr]);
  // B12 = B5 - (B6+B7+B8+B9+B10+B11)
  const operatingMargin = useMemo(() =>
    annualRevenue - (annualFuelCost + annualWearCost + annualLabourCost + annualOtherOpex + annualServiceMaintenance + annualDamageAllowance),
    [annualRevenue, annualFuelCost, annualWearCost, annualLabourCost, annualOtherOpex, annualServiceMaintenance, annualDamageAllowance]);
  // B13 = purchasePrice * residualValue
  const residualValueAmount = useMemo(() => purchasePrice * residualValue, [purchasePrice, residualValue]);
  // B14 = (purchasePrice - residualValueAmount) / machineLife
  const annualDepreciation = useMemo(() => (purchasePrice - residualValueAmount) / machineLife, [purchasePrice, residualValueAmount, machineLife]);
  // B15 = purchasePrice * insuranceRate
  const annualInsurance = useMemo(() => purchasePrice * insuranceRate, [purchasePrice, insuranceRate]);
  // B17 = B14 + B15 (Ownership Cost = Depreciation + Insurance)
  const ownershipCost = useMemo(() => annualDepreciation + annualInsurance, [annualDepreciation, annualInsurance]);
  // B18 = B12 - B17
  const netCashflow = useMemo(() => operatingMargin - ownershipCost, [operatingMargin, ownershipCost]);
  // B19 = IF B18<=0 THEN "N/A" ELSE purchasePrice / B18
  const paybackYears: number | string = useMemo(() => {
    if (netCashflow <= 0) return 'N/A';
    return purchasePrice / netCashflow;
  }, [purchasePrice, netCashflow]);
  // B20 = IF purchasePrice=0 THEN "-" ELSE B18/purchasePrice
  const cashROI = useMemo(() => {
    if (purchasePrice === 0) return '-';
    return netCashflow / purchasePrice;
  }, [purchasePrice, netCashflow]);

  // ===== Sensitivity Analysis =====
  const sensTPH = 0.1;
  const sensFuel = 0.15;
  const sensPrice = 0.1;
  const sensWear = 0.15;

  // Helper: calculate payback given modified revenue and costs
  const calcPayback = (rev: number, fuel: number, wear: number, labour: number, other: number, svc: number, dmg: number, own: number): number | string => {
    const margin = rev - (fuel + wear + labour + other + svc + dmg);
    const cf = margin - own;
    if (cf <= 0) return 'N/A';
    return purchasePrice / cf;
  };

  // Sensitivity: Utilisation (TPH) - changes TPH, affects Revenue AND Fuel AND Wear (all scale with TPH)
  const sensTPHResult = useMemo(() => {
    const atMinus = tph * (1 - sensTPH) * annualHours;
    const atPlus = tph * (1 + sensTPH) * annualHours;
    // Fuel also scales: when TPH changes, hours stay same but fuel use changes? 
    // Actually in V10, TPH change means throughput changes. Fuel cost is hours-based (not throughput-based),
    // but in the Sensitivity formula, Revenue AND all variable costs scale by same factor
    // V10 formula: Revenue*(1-$B$4) - (Fuel*(1-$B$4) + Wear*(1-$B$4) + Labour*(1-$B$4) + Other*(1-$B$4) + Svc*(1-$B$4) + Dmg*(1-$B$4))
    // This means when TPH drops 10%, ALL costs and revenue drop 10% (as if utilization hrs drop)
    const revMinus = annualRevenue * (1 - sensTPH);
    const revPlus = annualRevenue * (1 + sensTPH);
    const pbMinus = calcPayback(revMinus, annualFuelCost*(1-sensTPH), annualWearCost*(1-sensTPH),
      annualLabourCost*(1-sensTPH), annualOtherOpex*(1-sensTPH), annualServiceMaintenance*(1-sensTPH), annualDamageAllowance*(1-sensTPH), ownershipCost);
    const pbPlus = calcPayback(revPlus, annualFuelCost*(1+sensTPH), annualWearCost*(1+sensTPH),
      annualLabourCost*(1+sensTPH), annualOtherOpex*(1+sensTPH), annualServiceMaintenance*(1+sensTPH), annualDamageAllowance*(1+sensTPH), ownershipCost);
    return { pbMinus, pbPlus };
  }, [annualRevenue, annualFuelCost, annualWearCost, annualLabourCost, annualOtherOpex, annualServiceMaintenance, annualDamageAllowance, ownershipCost, purchasePrice, sensTPH, tph, annualHours]);

  // Sensitivity: Fuel Cost - only fuel cost changes
  const sensFuelResult = useMemo(() => {
    const pbMinus = calcPayback(annualRevenue, annualFuelCost*(1-sensFuel), annualWearCost, annualLabourCost, annualOtherOpex, annualServiceMaintenance, annualDamageAllowance, ownershipCost);
    const pbPlus = calcPayback(annualRevenue, annualFuelCost*(1+sensFuel), annualWearCost, annualLabourCost, annualOtherOpex, annualServiceMaintenance, annualDamageAllowance, ownershipCost);
    return { pbMinus, pbPlus };
  }, [annualRevenue, annualFuelCost, annualWearCost, annualLabourCost, annualOtherOpex, annualServiceMaintenance, annualDamageAllowance, ownershipCost, purchasePrice, sensFuel]);

  // Sensitivity: Selling Price - only revenue changes
  const sensPriceResult = useMemo(() => {
    const pbMinus = calcPayback(annualRevenue*(1-sensPrice), annualFuelCost, annualWearCost, annualLabourCost, annualOtherOpex, annualServiceMaintenance, annualDamageAllowance, ownershipCost);
    const pbPlus = calcPayback(annualRevenue*(1+sensPrice), annualFuelCost, annualWearCost, annualLabourCost, annualOtherOpex, annualServiceMaintenance, annualDamageAllowance, ownershipCost);
    return { pbMinus, pbPlus };
  }, [annualRevenue, annualFuelCost, annualWearCost, annualLabourCost, annualOtherOpex, annualServiceMaintenance, annualDamageAllowance, ownershipCost, purchasePrice, sensPrice]);

  // Sensitivity: Wear Cost - only wear cost changes
  const sensWearResult = useMemo(() => {
    const pbMinus = calcPayback(annualRevenue, annualFuelCost, annualWearCost*(1-sensWear), annualLabourCost, annualOtherOpex, annualServiceMaintenance, annualDamageAllowance, ownershipCost);
    const pbPlus = calcPayback(annualRevenue, annualFuelCost, annualWearCost*(1+sensWear), annualLabourCost, annualOtherOpex, annualServiceMaintenance, annualDamageAllowance, ownershipCost);
    return { pbMinus, pbPlus };
  }, [annualRevenue, annualFuelCost, annualWearCost, annualLabourCost, annualOtherOpex, annualServiceMaintenance, annualDamageAllowance, ownershipCost, purchasePrice, sensWear]);

  const basePayback = paybackYears;

  // ===== Formatting =====
  const fmt = (val: number) => `${sym}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const fmtPct = (val: number) => `${(val * 100).toFixed(1)}%`;
  const fmtPayback = (val: number | string) => {
    if (val === 'N/A') return 'N/A';
    return (val as number).toFixed(2);
  };
  const fmtDelta = (val: number | string, base: number | string) => {
    if (val === 'N/A' || base === 'N/A') return '-';
    const diff = (val as number) - (base as number);
    return diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="mesda-header text-white py-4 px-6 shadow-lg no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg px-3 py-1.5">
              <span className="text-mesda-dark font-bold text-xl tracking-wider">MESDA</span>
            </div>
            <h1 className="text-lg font-semibold">{t('ROI Model – Crushing & Screening')}</h1>
          </div>
          <button
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {language === 'zh' ? 'English' : '中文'}
          </button>
        </div>
      </header>

      {/* Tabs + Actions */}
      <div className="max-w-6xl mx-auto px-6 mt-6">
        <div className="flex items-center gap-2 mb-6 no-print">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition ${activeTab === 'settings' ? 'tab-active' : 'tab-inactive'}`}
          >
            <Settings size={18} />
            {t('Settings')}
          </button>
          <button
            onClick={() => setActiveTab('roi')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition ${activeTab === 'roi' ? 'tab-active' : 'tab-inactive'}`}
          >
            <DollarSign size={18} />
            {t('ROI Summary')}
          </button>
          <button
            onClick={() => setActiveTab('sensitivity')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition ${activeTab === 'sensitivity' ? 'tab-active' : 'tab-inactive'}`}
          >
            <TrendingUp size={18} />
            {language === 'zh' ? '敏感性分析' : 'Sensitivity'}
          </button>
          <div className="flex-1" />
          <button onClick={onExportPDF} className="mesda-btn-secondary flex items-center gap-2 text-sm">
            <Download size={16} /> {t('Download PDF')}
          </button>
          <button onClick={onSendEmail} className="mesda-btn flex items-center gap-2 text-sm">
            <Mail size={16} /> {t('Send to Email')}
          </button>
        </div>

        {/* ===== SETTINGS TAB ===== */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Machine Settings */}
            <div className="mesda-card">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t('Machine Settings')}</h2>
              <div className="space-y-3">
                <Field label={t('Machine Purchase Price')} prefix={sym}>
                  <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(+e.target.value||0)} className="mesda-input text-right w-full" />
                </Field>
                <Field label={t('Machine Life (Years)')} suffix={language==='zh'?'年':'yrs'}>
                  <input type="number" value={machineLife} onChange={e => setMachineLife(+e.target.value||1)} className="mesda-input text-right w-full" />
                </Field>
                <Field label={t('Residual Value (%)')} suffix="%">
                  <input type="number" value={(residualValue*100).toFixed(0)} onChange={e => setResidualValue((+e.target.value||0)/100)} className="mesda-input text-right w-full" />
                </Field>
                <Field label={t('Insurance (% of purchase / yr)')} suffix="%">
                  <input type="number" value={(insuranceRate*100).toFixed(1)} onChange={e => setInsuranceRate((+e.target.value||0)/100)} className="mesda-input text-right w-full" />
                </Field>
              </div>
            </div>

            {/* Territory & Currency */}
            <div className="mesda-card">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t('Territory Preset')}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{t('Territory')}</label>
                  <select value={territory} onChange={e => setTerritory(e.target.value as Territory)} className="mesda-input w-full">
                    <option value="Hard Rock">{t('Hard Rock')}</option>
                    <option value="Limestone">{t('Limestone')}</option>
                    <option value="Recycle">{t('Recycle')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{t('Currency')}</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value as Currency)} className="mesda-input w-full">
                    <option value="$">$ (USD)</option>
                    <option value="¥">¥ (CNY)</option>
                    <option value="€">€ (EUR)</option>
                    <option value="₫">₫ (VND)</option>
                    <option value="A$">A$ (AUD)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Operation Settings */}
            <div className="mesda-card lg:col-span-2">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t('Operation Settings')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                <Field label={t('Annual Utilisation (hrs)')} suffix={language==='zh'?'小时/年':'hrs/yr'}>
                  <input type="number" value={annualHours} onChange={e => setAnnualHours(+e.target.value||1)} className="mesda-input text-right w-full" />
                </Field>
                <Field label={t('Throughput (tph)')} suffix="TPH">
                  <input type="number" value={tph} onChange={e => setTph(+e.target.value||0)} className="mesda-input text-right w-full" />
                </Field>
                <Field label={t('Selling Price / ton')} prefix={sym}>
                  <input type="number" value={sellingPrice} onChange={e => setSellingPrice(+e.target.value||0)} className="mesda-input text-right w-full" />
                </Field>
                <Field label={t('Load Factor')} suffix="%">
                  <input type="number" value={(loadFactor*100).toFixed(0)} onChange={e => setLoadFactor(Math.min((+e.target.value||0)/100, 1))} className="mesda-input text-right w-full" max="100" />
                </Field>
                <Field label={t('Wear Cost / ton')} prefix={sym}>
                  <input type="number" value={wearCost} onChange={e => setWearCost(+e.target.value||0)} className="mesda-input text-right w-full" />
                </Field>
                <Field label={t('Labour Cost / hr')} prefix={sym}>
                  <input type="number" value={labourCost} onChange={e => setLabourCost(+e.target.value||0)} className="mesda-input text-right w-full" />
                </Field>
                <Field label={t('Other Opex / hr')} prefix={sym}>
                  <input type="number" value={otherOpex} onChange={e => setOtherOpex(+e.target.value||0)} className="mesda-input text-right w-full" />
                </Field>
              </div>
            </div>

            {/* Fuel Settings */}
            <div className="mesda-card lg:col-span-2">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t('Fuel Input Method')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{t('Fuel Input Method')}</label>
                  <select value={fuelMethod} onChange={e => setFuelMethod(e.target.value as FuelMethod)} className="mesda-input w-full">
                    <option value="Use/hr & cost/unit">{t('Use/hr & cost/unit')}</option>
                    <option value="Direct cost/hr">{t('Direct cost/hr')}</option>
                  </select>
                </div>
                {fuelMethod === 'Use/hr & cost/unit' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">{t('Fuel Unit (label only)')}</label>
                      <select value={fuelUnit} onChange={e => setFuelUnit(e.target.value as FuelUnit)} className="mesda-input w-full">
                        <option value="kWh">kWh</option>
                        <option value="L">L</option>
                        <option value="gal">gal</option>
                      </select>
                    </div>
                    <Field label={t('Base Fuel Use / hr @100% load')} suffix={fuelUnit+'/hr'}>
                      <input type="number" value={baseFuelUse} onChange={e => setBaseFuelUse(+e.target.value||0)} className="mesda-input text-right w-full" />
                    </Field>
                    <Field label={t('Fuel Cost / unit')} prefix={sym+'/'+fuelUnit}>
                      <input type="number" value={fuelCostPerUnit} onChange={e => setFuelCostPerUnit(+e.target.value||0)} className="mesda-input text-right w-full" />
                    </Field>
                    <Field label={t('Fuel Use / hr')} suffix={fuelUnit+'/hr'}>
                      <span className="font-mono text-gray-800">{actualFuelUse.toFixed(1)}</span>
                    </Field>
                    <Field label={t('Direct Fuel Cost / hr')} prefix={sym+'/hr'}>
                      <span className="font-mono text-gray-800">{fuelCostPerHr.toFixed(2)}</span>
                    </Field>
                  </>
                )}
                {fuelMethod === 'Direct cost/hr' && (
                  <Field label={t('Manual Direct Fuel Cost / hr')} prefix={sym+'/hr'}>
                    <input type="number" value={manualDirectFuelCost} onChange={e => setManualDirectFuelCost(+e.target.value||0)} className="mesda-input text-right w-full" />
                  </Field>
                )}
              </div>
            </div>

            {/* Service & Maintenance */}
            <div className="mesda-card lg:col-span-2">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t('Service & Maintenance Inputs')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                <Field label={t('Service Interval (hrs)')} suffix={language==='zh'?'小时':'hrs'}>
                  <input type="number" value={serviceInterval} onChange={e => setServiceInterval(+e.target.value||1)} className="mesda-input text-right w-full" />
                </Field>
                <Field label={t('Service Cost per event')} prefix={sym}>
                  <input type="number" value={serviceCost} onChange={e => setServiceCost(+e.target.value||0)} className="mesda-input text-right w-full" />
                </Field>
                <Field label={t('Hydraulic Oil Interval (hrs)')} suffix={language==='zh'?'小时':'hrs'}>
                  <input type="number" value={hydraulicInterval} onChange={e => setHydraulicInterval(+e.target.value||1)} className="mesda-input text-right w-full" />
                </Field>
                <Field label={t('Hydraulic Oil Change Cost')} prefix={sym}>
                  <input type="number" value={hydraulicCost} onChange={e => setHydraulicCost(+e.target.value||0)} className="mesda-input text-right w-full" />
                </Field>
                <Field label={t('Damage/Repairs Allowance')} prefix={sym+'/'+(language==='zh'?'小时':'hr')}>
                  <span className="font-mono text-gray-800">{damageAllowancePerHr.toFixed(2)}</span>
                </Field>
              </div>
            </div>
          </div>
        )}

        {/* ===== ROI SUMMARY TAB ===== */}
        {activeTab === 'roi' && (
          <div className="mesda-card max-w-3xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">{t('ROI Summary')}</h2>
            <div className="space-y-0">
              <Row label={t('Annual Throughput (t/yr)')} value={`${annualThroughput.toLocaleString()} t/yr`} />
              <Row label={t('Revenue / yr')} value={fmt(annualRevenue)} highlight />
              <Row label={t('Fuel Cost / yr')} value={fmt(annualFuelCost)} />
              <Row label={t('Wear Cost / yr')} value={fmt(annualWearCost)} />
              <Row label={t('Labour Cost / yr')} value={fmt(annualLabourCost)} />
              <Row label={t('Other Opex / yr')} value={fmt(annualOtherOpex)} />
              <Row label={t('Service & Maintenance / yr')} value={fmt(annualServiceMaintenance)} />
              <Row label={t('Damage/Repairs Allowance / yr')} value={fmt(annualDamageAllowance)} />
              <Row label={t('Operating Margin / yr')} value={fmt(operatingMargin)} highlight />
              <div className="border-t-2 border-gray-200 my-2" />
              <Row label={t('Residual Value (end of life)')} value={fmt(residualValueAmount)} />
              <Row label={t('Depreciation / yr')} value={fmt(annualDepreciation)} />
              <Row label={t('Insurance / yr')} value={fmt(annualInsurance)} />
              <Row label={t('Ownership Cost / yr')} value={fmt(ownershipCost)} highlight />
              <div className="border-t-2 border-gray-200 my-2" />
              <Row label={t('Net Cashflow / yr (pre-tax)')} value={fmt(netCashflow)} highlight />
              <Row label={t('Simple Payback (years)')} value={fmtPayback(paybackYears)} highlight suffix={paybackYears!=='N/A'?(language==='zh'?'年':'yrs'):''} />
              <Row label={t('Cash ROI')} value={cashROI==='-'?'-':fmtPct(cashROI as number)} highlight />
            </div>
          </div>
        )}

        {/* ===== SENSITIVITY TAB ===== */}
        {activeTab === 'sensitivity' && (
          <div className="mesda-card">
            <h2 className="text-lg font-bold text-gray-800 mb-2">{t('Sensitivity Analysis (payback impact)')}</h2>
            <p className="text-sm text-gray-500 mb-4">
              {language==='zh'?'基准回本年限': 'Base Payback'}: {fmtPayback(basePayback)} {basePayback!=='N/A'?(language==='zh'?'年':'yrs'):''}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 font-semibold">{t('Driver')}</th>
                    <th className="text-right p-3 font-semibold">{t('Payback (-)')}</th>
                    <th className="text-right p-3 font-semibold bg-mesda-light/30">{t('Payback (Base)')}</th>
                    <th className="text-right p-3 font-semibold">{t('Payback (+)')}</th>
                    <th className="text-right p-3 font-semibold text-red-600">{t('Δ yrs (-)')}</th>
                    <th className="text-right p-3 font-semibold text-green-600">{t('Δ yrs (+)')}</th>
                  </tr>
                </thead>
                <tbody>
                  <SensRow
                    label={`${t('TPH +/-')} (${(sensTPH*100).toFixed(0)}%)`}
                    sublabel={`TPH: ${tph}`}
                    pbMinus={sensTPHResult.pbMinus}
                    base={basePayback}
                    pbPlus={sensTPHResult.pbPlus}
                  />
                  <SensRow
                    label={`${t('Fuel Cost +/-')} (${(sensFuel*100).toFixed(0)}%)`}
                    sublabel={`${sym}${fuelCostPerUnit}/${fuelUnit}`}
                    pbMinus={sensFuelResult.pbMinus}
                    base={basePayback}
                    pbPlus={sensFuelResult.pbPlus}
                  />
                  <SensRow
                    label={`${t('Selling Price +/-')} (${(sensPrice*100).toFixed(0)}%)`}
                    sublabel={`${sym}${sellingPrice}/${language==='zh'?'吨':'ton'}`}
                    pbMinus={sensPriceResult.pbMinus}
                    base={basePayback}
                    pbPlus={sensPriceResult.pbPlus}
                  />
                  <SensRow
                    label={`${t('Wear Cost +/-')} (${(sensWear*100).toFixed(0)}%)`}
                    sublabel={`${sym}${wearCost}/${language==='zh'?'吨':'ton'}`}
                    pbMinus={sensWearResult.pbMinus}
                    base={basePayback}
                    pbPlus={sensWearResult.pbPlus}
                  />
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-8 py-4 text-center text-gray-400 text-xs no-print">
        © {new Date().getFullYear()} MESDA. {language==='zh'?'版权所有':'All rights reserved.'}
      </footer>
    </div>
  );
};

// Reusable components
const Field: React.FC<{
  label: string;
  prefix?: string;
  suffix?: string;
  children: React.ReactNode;
}> = ({ label, prefix, suffix, children }) => (
  <div className="flex items-center justify-between py-1.5">
    <label className="text-sm text-gray-600 min-w-[180px]">{label}</label>
    <div className="flex items-center gap-1">
      {prefix && <span className="text-xs text-gray-400">{prefix}</span>}
      {children}
      {suffix && <span className="text-xs text-gray-400">{suffix}</span>}
    </div>
  </div>
);

const Row: React.FC<{
  label: string;
  value: string;
  highlight?: boolean;
  suffix?: string;
}> = ({ label, value, highlight, suffix }) => (
  <div className={`flex items-center justify-between py-2 border-b border-gray-100 ${highlight ? 'bg-mesda-light/10 font-semibold' : ''}`}>
    <span className="text-sm text-gray-600">{label}</span>
    <span className={`font-mono text-sm ${highlight ? 'text-mesda-dark' : 'text-gray-800'}`}>
      {value} {suffix || ''}
    </span>
  </div>
);

const SensRow: React.FC<{
  label: string;
  sublabel: string;
  pbMinus: number | string;
  base: number | string;
  pbPlus: number | string;
}> = ({ label, sublabel, pbMinus, base, pbPlus }) => (
  <tr className="border-b border-gray-100 hover:bg-gray-50">
    <td className="p-3">
      <div className="font-medium text-gray-800">{label}</div>
      <div className="text-xs text-gray-400">{sublabel}</div>
    </td>
    <td className="p-3 text-right font-mono">{fmtPB(pbMinus)}</td>
    <td className="p-3 text-right font-mono bg-mesda-light/10">{fmtPB(base)}</td>
    <td className="p-3 text-right font-mono">{fmtPB(pbPlus)}</td>
    <td className="p-3 text-right font-mono text-red-600">{fmtDelta(pbMinus, base)}</td>
    <td className="p-3 text-right font-mono text-green-600">{fmtDelta(pbPlus, base)}</td>
  </tr>
);

const fmtPB = (v: number | string) => v === 'N/A' ? 'N/A' : (v as number).toFixed(2);
const fmtDelta = (v: number | string, base: number | string) => {
  if (v === 'N/A' || base === 'N/A') return '-';
  const d = (v as number) - (base as number);
  return d > 0 ? `+${d.toFixed(2)}` : d.toFixed(2);
};

export default Calculator;
