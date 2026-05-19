'use client';

import { create } from "zustand";

interface Scenario {
  conversionRate: number;
  hhCapture: number[];
  woundCapture: number[];
  therapyCapture: number[];
  marginOverrides: Record<string, number>;
}

interface SavedScenario {
  id: string;
  name: string;
  description: string;
  data: Scenario;
  createdAt: string;
}

interface ScenarioStore {
  currentScenario: Scenario;
  scenarios: SavedScenario[];
  activeScenarioId: string | null;
  updateScenario: (updates: Partial<Scenario>) => void;
  saveScenario: (name: string, description?: string) => string;
  loadScenario: (id: string) => void;
  deleteScenario: (id: string) => void;
  updateScenarioMetadata: (id: string, name: string, description: string) => void;
  compareScenarios: (ids: string[]) => (SavedScenario | { id: string; name: string; data: Scenario } | undefined)[];
  resetToDefault: () => void;
  exportScenarios: () => string;
  importScenarios: (jsonString: string) => boolean;
  getScenarioStats: () => {
    totalScenarios: number;
    hasSavedScenarios: boolean;
    activeScenario: SavedScenario | undefined;
  };
}

const DEFAULT_SCENARIO: Scenario = {
  conversionRate: 0.75,
  hhCapture: [0.1, 0.15, 0.2],
  woundCapture: [0.25, 0.35, 0.45],
  therapyCapture: [0.2, 0.3, 0.4],
  marginOverrides: {},
};

export const useScenarioStore = create<ScenarioStore>((set, get) => ({
  currentScenario: DEFAULT_SCENARIO,
  scenarios: [],
  activeScenarioId: null,

  updateScenario: (updates) =>
    set((state) => ({
      currentScenario: { ...state.currentScenario, ...updates },
    })),

  saveScenario: (name, description = "") => {
    const state = get();
    const newScenario: SavedScenario = {
      id: Date.now().toString(),
      name,
      description,
      data: state.currentScenario,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      scenarios: [...state.scenarios, newScenario],
      activeScenarioId: newScenario.id,
    }));
    return newScenario.id;
  },

  loadScenario: (id) => {
    const state = get();
    const scenario = state.scenarios.find((s) => s.id === id);
    if (scenario) {
      set({
        currentScenario: scenario.data,
        activeScenarioId: id,
      });
    }
  },

  deleteScenario: (id) =>
    set((state) => ({
      scenarios: state.scenarios.filter((s) => s.id !== id),
      activeScenarioId: state.activeScenarioId === id ? null : state.activeScenarioId,
    })),

  updateScenarioMetadata: (id, name, description) =>
    set((state) => ({
      scenarios: state.scenarios.map((s) =>
        s.id === id ? { ...s, name, description } : s
      ),
    })),

  compareScenarios: (ids) => {
    const state = get();
    return ids.map((id) =>
      id === "current"
        ? { id: "current", name: "Current", data: state.currentScenario }
        : state.scenarios.find((s) => s.id === id)
    );
  },

  resetToDefault: () =>
    set({
      currentScenario: DEFAULT_SCENARIO,
      activeScenarioId: null,
    }),

  exportScenarios: () => {
    const state = get();
    return JSON.stringify({
      current: state.currentScenario,
      scenarios: state.scenarios,
      exportDate: new Date().toISOString(),
    });
  },

  importScenarios: (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      set({
        currentScenario: data.current || DEFAULT_SCENARIO,
        scenarios: data.scenarios || [],
      });
      return true;
    } catch (error) {
      console.error("Failed to import scenarios:", error);
      return false;
    }
  },

  getScenarioStats: () => {
    const state = get();
    return {
      totalScenarios: state.scenarios.length,
      hasSavedScenarios: state.scenarios.length > 0,
      activeScenario: state.scenarios.find((s) => s.id === state.activeScenarioId),
    };
  },
}));
