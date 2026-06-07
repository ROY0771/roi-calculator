import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export type Currency = '¥' | '$' | '€' | '₫' | 'A$';
export type FuelMethod = 'Use/hr & cost/unit' | 'Direct cost/hr';
export type FuelUnit = 'kWh' | 'L' | 'gal';
export type Territory = 'Hard Rock' | 'Limestone' | 'Recycle';
export type Language = 'zh' | 'en';

interface SettingsState {
  // Territory
  territory: Territory;
  setTerritory: (t: Territory) => void;
  
  // Selling parameters (E column)
  sellingPrice: number;
  setSellingPrice: (v: number) => void;
  loadFactor: number;
  setLoadFactor: (v: number) => void;
  wearCost: number;
  setWearCost: (v: number) => void;
  tph: number;
  setTph: (v: number) => void;
  
  // Purchase settings (B column)
  purchasePrice: number;
  setPurchasePrice: (v: number) => void;
  machineLife: number;
  setMachineLife: (v: number) => void;
  residualValue: number;
  setResidualValue: (v: number) => void;
  insuranceRate: number;
  setInsuranceRate: (v: number) => void;
  annualHours: number;
  setAnnualHours: (v: number) => void;
  labourCost: number;
  setLabourCost: (v: number) => void;
  otherOpex: number;
  setOtherOpex: (v: number) => void;
  fuelMethod: FuelMethod;
  setFuelMethod: (m: FuelMethod) => void;
  fuelUnit: FuelUnit;
  setFuelUnit: (u: FuelUnit) => void;
  fuelCostPerUnit: number;
  setFuelCostPerUnit: (v: number) => void;
  baseFuelUse: number;
  setBaseFuelUse: (v: number) => void;
  manualDirectFuelCost: number;
  setManualDirectFuelCost: (v: number) => void;
  serviceInterval: number;
  setServiceInterval: (v: number) => void;
  serviceCost: number;
  setServiceCost: (v: number) => void;
  hydraulicInterval: number;
  setHydraulicInterval: (v: number) => void;
  hydraulicCost: number;
  setHydraulicCost: (v: number) => void;
  
  // Currency
  currency: Currency;
  setCurrency: (c: Currency) => void;
  
  // Language
  language: Language;
  setLanguage: (l: Language) => void;
  
  // Computed values (Settings internal)
  getActualFuelUse: () => number;
  getFuelCostPerHour: () => number;
  getDamageAllowance: () => number;
}

export const useCalculatorStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Defaults
      territory: 'Hard Rock',
      sellingPrice: 15,
      loadFactor: 0.75,
      wearCost: 0.8,
      tph: 160,
      purchasePrice: 700000,
      machineLife: 5,
      residualValue: 0.2,
      insuranceRate: 0.015,
      annualHours: 2000,
      labourCost: 30,
      otherOpex: 1000,
      fuelMethod: 'Use/hr & cost/unit',
      fuelUnit: 'kWh',
      fuelCostPerUnit: 2,
      baseFuelUse: 110,
      manualDirectFuelCost: 0,
      serviceInterval: 500,
      serviceCost: 1500,
      hydraulicInterval: 1500,
      hydraulicCost: 200,
      currency: '$',
      language: 'zh',
      
      setTerritory: (t) => set({ territory: t }),
      setSellingPrice: (v) => set({ sellingPrice: v }),
      setLoadFactor: (v) => set({ loadFactor: v }),
      setWearCost: (v) => set({ wearCost: v }),
      setTph: (v) => set({ tph: v }),
      setPurchasePrice: (v) => set({ purchasePrice: v }),
      setMachineLife: (v) => set({ machineLife: v }),
      setResidualValue: (v) => set({ residualValue: v }),
      setInsuranceRate: (v) => set({ insuranceRate: v }),
      setAnnualHours: (v) => set({ annualHours: v }),
      setLabourCost: (v) => set({ labourCost: v }),
      setOtherOpex: (v) => set({ otherOpex: v }),
      setFuelMethod: (m) => set({ fuelMethod: m }),
      setFuelUnit: (u) => set({ fuelUnit: u }),
      setFuelCostPerUnit: (v) => set({ fuelCostPerUnit: v }),
      setBaseFuelUse: (v) => set({ baseFuelUse: v }),
      setManualDirectFuelCost: (v) => set({ manualDirectFuelCost: v }),
      setServiceInterval: (v) => set({ serviceInterval: v }),
      setServiceCost: (v) => set({ serviceCost: v }),
      setHydraulicInterval: (v) => set({ hydraulicInterval: v }),
      setHydraulicCost: (v) => set({ hydraulicCost: v }),
      setCurrency: (c) => set({ currency: c }),
      setLanguage: (l) => set({ language: l }),
      
      // Computed: B17 = BaseFuelUse * LoadFactor
      getActualFuelUse: () => get().baseFuelUse * get().loadFactor,
      
      // Computed: B18 = Direct method ? B20 : B17 * fuelCostPerUnit
      getFuelCostPerHour: () => {
        const state = get();
        if (state.fuelMethod === 'Direct cost/hr') {
          return state.manualDirectFuelCost;
        }
        return state.getActualFuelUse() * state.fuelCostPerUnit;
      },
      
      // Computed: B26 = (purchasePrice / machineLife / annualHours) * 0.1
      getDamageAllowance: () => (get().purchasePrice / get().machineLife / get().annualHours) * 0.1,
    }),
    {
      name: 'mesda-calculator-storage',
    }
  )
);
