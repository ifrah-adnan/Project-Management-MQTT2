import { NodeTypes } from "@/utils/types";
import { create } from "zustand";

type State = {
  nodes: NodeTypes[];
  edges: any[];
  nodeSelected: NodeTypes | null;
  selectedDragElement: {
    id: string;
    type: string;
    name: string;
  } | null;
};

type Actions = {
    setNodes: (nodes: State["nodes"]) => void;
    setEdges: (edges: State["edges"]) => void;
    setNodeSelected: (node: NodeTypes | null) => void;
    setSelectedDragElement: (node: {
        id: string;
        type: string;
        name: string;
    
    } | null) => void;
    
};


const defaultState: State = {
    nodes: [] ,
    edges: [],
    nodeSelected: null,
    selectedDragElement:null,
};

export const useStore = create<State & Actions>((set) => ({
    ...defaultState,
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    setNodeSelected: (nodeSelected) => set({ nodeSelected }),
    setSelectedDragElement: (selectedDragElement) => set({ selectedDragElement }),
}));