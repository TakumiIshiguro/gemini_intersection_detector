
export enum HallwayShape {
  STRAIGHT_ROAD = "straight_road",
  DEAD_END = "dead_end",
  CORNER_RIGHT = "corner_right",
  CORNER_LEFT = "corner_left",
  CROSS_ROAD = "cross_road",
  THREE_WAY_RIGHT = "3_way_right",
  THREE_WAY_CENTER = "3_way_center",
  THREE_WAY_LEFT = "3_way_left"
}

export interface AnalysisResult {
  shape: HallwayShape;
  label: string;
  reason: string;
  confidence: number;
}
