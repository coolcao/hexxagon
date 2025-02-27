export interface BoardCell {
  id: number;
  row: number;
  col: number;
  show: boolean;
  first?: boolean;
  second?: boolean;
  player?: 1 | 2;   // 当前已放置玩家的棋子，1:红方 2:蓝方
  selected?: boolean; // 标记是否被选中
}
