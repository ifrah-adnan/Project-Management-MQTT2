import { create } from "zustand";

type State = {
  filters: {
    name: string;
    status: string;
  };
};

type Actions = {
  setFilters: (filters: State["filters"]) => void;
  resetFilters: () => void;
};

const defaultState: State = {
  filters: {
    name: "",
    status: "ALL",
  },
};

export const useStore = create<State & Actions>((set) => ({
  ...defaultState,
  setFilters: (filters) => set({ filters }),
  resetFilters: () => set({ filters: defaultState.filters }),
}));
