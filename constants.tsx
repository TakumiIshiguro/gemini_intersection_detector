
import React from 'react';
import { HallwayShape } from './types';

export const SHAPE_LABELS: Record<HallwayShape, string> = {
  [HallwayShape.STRAIGHT_ROAD]: "[0] straight_road",
  [HallwayShape.DEAD_END]: "[1] dead_end",
  [HallwayShape.CORNER_RIGHT]: "[2] corner_right",
  [HallwayShape.CORNER_LEFT]: "[3] corner_left",
  [HallwayShape.CROSS_ROAD]: "[4] cross_road",
  [HallwayShape.THREE_WAY_RIGHT]: "[5] 3_way_right",
  [HallwayShape.THREE_WAY_CENTER]: "[6] 3_way_center",
  [HallwayShape.THREE_WAY_LEFT]: "[7] 3_way_left",
};

export const SHAPE_DESCRIPTIONS: Record<HallwayShape, string> = {
  [HallwayShape.STRAIGHT_ROAD]: "直進通路。分岐のない真っ直ぐな道です。",
  [HallwayShape.DEAD_END]: "行き止まり。通路の終端です。",
  [HallwayShape.CORNER_RIGHT]: "右折コーナー。右に曲がるだけの通路です。",
  [HallwayShape.CORNER_LEFT]: "左折コーナー。左に曲がるだけの通路です。",
  [HallwayShape.CROSS_ROAD]: "十字路。4方向に道が分かれています。",
  [HallwayShape.THREE_WAY_RIGHT]: "三叉路（右）。直進通路の右側に分岐があります。",
  [HallwayShape.THREE_WAY_CENTER]: "三叉路（中央）。突き当たりのT字路で、左右に分かれます。",
  [HallwayShape.THREE_WAY_LEFT]: "三叉路（左）。直進通路の左側に分岐があります。",
};
