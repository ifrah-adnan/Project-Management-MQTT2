export type NodeTypes = {
    id: string;
    type: string;
    data: Record<string, unknown>;
    position: { x: number; y: number };
    };


export type EdgeTypes ={
    id: string;
    source: string;
    target: string;
    animated: boolean;
    label: string;
    style?: { stroke: string; strokeWidth: number };
    arrowHeadType?: string;
    type: string;
    labelStyle?: { fill: string; fontWeight: number };
    labelBgStyle?: { fill: string; fillOpacity: number };
    labelBgPadding?: [number, number];
    labelBgBorderRadius?: number;
}