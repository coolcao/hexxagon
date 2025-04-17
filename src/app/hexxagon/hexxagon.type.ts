export enum CellColor {
  RED = 'red',
  BLUE = 'blue',
}
export interface BoardCell {
  id: number;
  row: number;
  col: number;
  show: boolean;
  first?: boolean;
  second?: boolean;
  color?: CellColor;   // 当前已放置玩家的棋子，1:红方 2:蓝方
  selected?: boolean; // 标记是否被选中
}

export interface ActionOperation {
  action: 'jump' | 'copy';
  cells: BoardCell[][];
  fromId: number;
  toId: number;
  color: CellColor;
}

export interface RoomInfo {
  roomName: string;
}

export interface MoveEventData {
  action: 'select' | 'unselect' | 'copy' | 'jump';
  fromId: number;
  toId: number;
  color: CellColor;
}

export enum PeerEventType {
  ROOM_INFO = 'room-info',
  READY = 'ready',
  MOVE = 'move',
}
export interface PeerDataEvent<T> {
  event: PeerEventType;
  data: T
}

export enum ClickStep {
  SELECT = 'select',
  MOVE = 'move',
}

export enum PlayerState {
  INITIAL = 'initial',
  READY = 'ready',
  PLAYING = 'playing',
  FINISHED = 'finished',
  WIN = 'win',
  LOSE = 'lose',
}

export enum GameState {
  INITIAL = 'initial',  // 初始状态
  WAITING = 'waiting',  // 等待对方准备
  PEER_CONNECTED = 'peer-connected', // 对方已连接
  READY = 'ready',       // 双方都已准备好
  STARTED = 'started',  // 游戏开始
  FINISHED = 'finished', // 游戏结束
}
