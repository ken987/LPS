import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IncomeSource, Asset, Liability, LifeEvent, SimulationSettings, FamilyMember, RecurringExpense, InvestmentFlow } from './types';


interface AppState {
    settings: SimulationSettings;
    incomes: IncomeSource[];
    events: LifeEvent[];
    assets: Asset[];
    liabilities: Liability[];
    recurringExpenses: RecurringExpense[];
    investmentFlows: InvestmentFlow[];

    setSettings: (settings: Partial<SimulationSettings>) => void;

    addRecurringExpense: (expense: RecurringExpense) => void;
    updateRecurringExpense: (id: string, expense: Partial<RecurringExpense>) => void;
    removeRecurringExpense: (id: string) => void;

    addIncome: (income: IncomeSource) => void;
    updateIncome: (id: string, income: Partial<IncomeSource>) => void;
    removeIncome: (id: string) => void;

    addEvent: (event: LifeEvent) => void;
    updateEvent: (id: string, event: Partial<LifeEvent>) => void;
    removeEvent: (id: string) => void;

    addAsset: (asset: Asset) => void;
    updateAsset: (id: string, asset: Partial<Asset>) => void;
    removeAsset: (id: string) => void;

    addLiability: (liability: Liability) => void;
    updateLiability: (id: string, liability: Partial<Liability>) => void;
    removeLiability: (id: string) => void;

    addFamilyMember: (member: FamilyMember) => void;
    updateFamilyMember: (id: string, member: Partial<FamilyMember>) => void;
    removeFamilyMember: (id: string) => void;

    addInvestmentFlow: (flow: InvestmentFlow) => void;
    updateInvestmentFlow: (id: string, flow: Partial<InvestmentFlow>) => void;
    removeInvestmentFlow: (id: string) => void;

    reset: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            settings: {
                currentYear: new Date().getFullYear(),
                currentAge: 30,
                deathAge: 90,
                baseLivingCost: 0,
                inflationRate: 0.0,
                cashReserve: 0,
                cashName: '貯蓄',
                surplusAllocation: 'Save',
                family: [],
                lifestyle: {
                    housingType: 'Rent',
                    carCount: 0,
                    hasInsurance: false,
                },
                defaultReturnRate: 3.0,
            },
            incomes: [],
            events: [],
            assets: [],
            liabilities: [],
            recurringExpenses: [],
            investmentFlows: [],

            setSettings: (newSettings) =>
                set((state) => ({ settings: { ...state.settings, ...newSettings } })),

            addFamilyMember: (member) =>
                set((state) => ({
                    settings: {
                        ...state.settings,
                        family: [...(state.settings.family || []), member],
                    },
                })),
            updateFamilyMember: (id, member) =>
                set((state) => ({
                    settings: {
                        ...state.settings,
                        family: (state.settings.family || []).map((m) => (m.id === id ? { ...m, ...member } : m)),
                    },
                })),
            removeFamilyMember: (id) =>
                set((state) => ({
                    settings: {
                        ...state.settings,
                        family: (state.settings.family || []).filter((m) => m.id !== id),
                    },
                })),

            addRecurringExpense: (expense) => set((state) => ({ recurringExpenses: [...state.recurringExpenses, expense] })),
            updateRecurringExpense: (id, expense) =>
                set((state) => ({
                    recurringExpenses: state.recurringExpenses.map((e) => (e.id === id ? { ...e, ...expense } : e)),
                })),
            removeRecurringExpense: (id) => set((state) => ({ recurringExpenses: state.recurringExpenses.filter((e) => e.id !== id) })),

            addIncome: (income) => set((state) => ({ incomes: [...state.incomes, income] })),
            updateIncome: (id, amount) =>
                set((state) => ({
                    incomes: state.incomes.map((i) => (i.id === id ? { ...i, ...amount } : i)),
                })),
            removeIncome: (id) => set((state) => ({ incomes: state.incomes.filter((i) => i.id !== id) })),

            addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
            updateEvent: (id, event) =>
                set((state) => ({
                    events: state.events.map((e) => (e.id === id ? { ...e, ...event } : e)),
                })),
            removeEvent: (id) => set((state) => ({ events: state.events.filter((e) => e.id !== id) })),

            addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
            updateAsset: (id, asset) =>
                set((state) => ({
                    assets: state.assets.map((a) => (a.id === id ? { ...a, ...asset } : a)),
                })),
            removeAsset: (id) => set((state) => ({ assets: state.assets.filter((a) => a.id !== id) })),

            addLiability: (liability) => set((state) => ({ liabilities: [...state.liabilities, liability] })),
            updateLiability: (id, liability) =>
                set((state) => ({
                    liabilities: state.liabilities.map((l) => (l.id === id ? { ...l, ...liability } : l)),
                })),
            removeLiability: (id) =>
                set((state) => ({ liabilities: state.liabilities.filter((l) => l.id !== id) })),

            addInvestmentFlow: (flow) => set((state) => ({ investmentFlows: [...(state.investmentFlows || []), flow] })),
            updateInvestmentFlow: (id, flow) =>
                set((state) => ({
                    investmentFlows: (state.investmentFlows || []).map((f) => (f.id === id ? { ...f, ...flow } : f)),
                })),
            removeInvestmentFlow: (id) =>
                set((state) => ({ investmentFlows: (state.investmentFlows || []).filter((f) => f.id !== id) })),

            reset: () =>
                set({
                    settings: {
                        currentYear: new Date().getFullYear(),
                        currentAge: 30,
                        deathAge: 90,
                        baseLivingCost: 0,
                        inflationRate: 0.0,
                        cashReserve: 0,
                        cashName: '貯蓄',
                        family: [],
                        lifestyle: {
                            housingType: 'Rent',
                            carCount: 0,
                            hasInsurance: false,
                        },
                        defaultReturnRate: 3.0,
                    },
                    incomes: [],
                    events: [],
                    assets: [],
                    liabilities: [],
                    recurringExpenses: [],
                    investmentFlows: [],
                }),
        }),
        {
            name: 'personal-cfo-storage',
            version: 6,
            migrate: (persistedState: any, version) => {
                let state = persistedState;

                if (version === 0) {
                    state = {
                        ...state,
                        settings: {
                            ...state.settings,
                            lifestyle: {
                                housingType: 'Rent',
                                carCount: 0,
                                hasInsurance: false,
                            }
                        },
                        recurringExpenses: state.recurringExpenses || [],
                    };
                }

                if (version <= 1) {
                    // Migration v1 -> v2
                    state = {
                        ...state,
                        investmentFlows: [],
                        recurringExpenses: (state.recurringExpenses || []).map((e: any) => ({
                            ...e,
                            isMonthly: true,
                            duration: undefined
                        }))
                    };
                }

                if (version <= 2) {
                    // Migration v2 -> v3
                    // Add defaultReturnRate to settings
                    state = {
                        ...state,
                        settings: {
                            ...state.settings,
                            defaultReturnRate: 3.0
                        }
                    };
                }

                if (version <= 4) {
                    // Migration v4 -> v5
                    // Add baseLivingCost update logic if it is the old default (3,000,000)
                    state = {
                        ...state,
                        settings: {
                            ...state.settings,
                            baseLivingCost: state.settings.baseLivingCost === 3000000 ? 0 : state.settings.baseLivingCost
                        }
                    };
                }

                if (version <= 5) {
                    // Migration v5 -> v6
                    // Add currentYear
                    state = {
                        ...state,
                        settings: {
                            ...state.settings,
                            currentYear: new Date().getFullYear()
                        }
                    };
                }

                return state;
            },
        }
    )
);
