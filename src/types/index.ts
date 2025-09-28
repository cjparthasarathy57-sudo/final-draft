export interface PlotData {
  image: File;
  plotWidth: number;
  plotHeight: number;
  scaleBarPx?: number;
  scaleBarM?: number;
}

export interface Requirements {
  bedrooms: number;
  bathrooms: number;
  kitchenOrientation: 'north' | 'south' | 'east' | 'west';
  vastuPreferences: {
    entranceDirection: 'north' | 'south' | 'east' | 'west';
    masterBedroomPosition: 'southwest' | 'northwest' | 'southeast' | 'northeast';
    kitchenPosition: 'southeast' | 'northwest' | 'northeast' | 'southwest';
    pujaRoom: boolean;
  };
  additionalRooms: string[];
}

export interface Room {
  name: string;
  bbox_px: [number, number, number, number];
  x_m: number;
  y_m: number;
  w_m: number;
  h_m: number;
  area_m2: number;
  type?: string;
}

export interface ProcessedData {
  plot_bbox_px: [number, number, number, number];
  meters_per_px: number;
  layout: Room[];
  wall_lines: Array<{x1: number, y1: number, x2: number, y2: number}>;
  openings: Array<{x: number, y: number, w: number, h: number}>;
  dxf_path?: string;
}

export interface GeneratedPlan {
  rooms: Room[];
  vastu_score: number;
  suggestions: string[];
  svg_content: string;
  total_area: number;
}

export interface AppState {
  currentStep: number;
  plotData: PlotData | null;
  requirements: Requirements | null;
  processedData: ProcessedData | null;
  generatedPlan: GeneratedPlan | null;
  isLoading: boolean;
  error: string | null;
}