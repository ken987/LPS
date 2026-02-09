import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SimulationSettings, IncomeSource, LifeEvent, Asset, Liability, RecurringExpense, InvestmentFlow } from '../types';

export interface ScenarioData {
    settings: SimulationSettings;
    incomes: IncomeSource[];
    events: LifeEvent[];
    assets: Asset[];
    liabilities: Liability[];
    recurringExpenses: RecurringExpense[];
    investmentFlows: InvestmentFlow[];
}

export interface Scenario {
    id: string;
    name: string;
    updatedAt: number;
    data: ScenarioData;
}

interface ScenarioState {
    scenarios: Scenario[];
    currentScenarioId: string | null;

    saveScenario: (name: string, data: ScenarioData) => void;
    updateScenario: (id: string, data: ScenarioData) => void;
    loadScenario: (id: string) => ScenarioData | null;
    deleteScenario: (id: string) => void;
    setCurrentScenarioId: (id: string | null) => void;
}

export const useScenarioStore = create<ScenarioState>()(
    persist(
        (set, get) => ({
            scenarios: [],
            currentScenarioId: null,

            saveScenario: (name, data) => {
                const newScenario: Scenario = {
                    id: crypto.randomUUID(),
                    name,
                    updatedAt: Date.now(),
                    data,
                };
                set((state) => ({
                    scenarios: [...state.scenarios, newScenario],
                    currentScenarioId: newScenario.id,
                }));
            },

            updateScenario: (id, data) => {
                set((state) => ({
                    scenarios: state.scenarios.map((s) =>
                        s.id === id ? { ...s, data, updatedAt: Date.now() } : s
                    ),
                }));
            },

            loadScenario: (id) => {
                const scenario = get().scenarios.find((s) => s.id === id);
                if (scenario) {
                    set({ currentScenarioId: id });
                    return scenario.data;
                }
                return null;
            },

            deleteScenario: (id) => {
                set((state) => ({
                    scenarios: state.scenarios.filter((s) => s.id !== id),
                    currentScenarioId: state.currentScenarioId === id ? null : state.currentScenarioId,
                }));
            },

            setCurrentScenarioId: (id) => set({ currentScenarioId: id }),
        }),
        {
            name: 'personal-cfo-scenarios',
        }
    )
);
