import { inject, Injectable } from "@angular/core";
import Peer, { DataConnection } from 'peerjs';
import { CellColor, GameState, MoveEventData, PeerDataEvent, PeerEventType, PlayerState, RoomInfo } from "../hexxagon.type";
import { HexxagonStore } from "../store/hexxagon.store";
import { MyStore } from "../store/my.store";
import { PeerStore } from "../store/peer.store";
import { AlertService } from "../../share/alert/alert.service";
import { HexxagonService } from "./hexxagon.service";

@Injectable({
  providedIn: 'root'
})
export class PeerService {
  private store = inject(HexxagonStore);
  private myStore = inject(MyStore);
  private peerStore = inject(PeerStore);
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private alert = inject(AlertService);
  private service = inject(HexxagonService)

  constructor() {
    this.initPeer();
  }

  initPeer() {
    const peer = new Peer();
    this.peer = peer;
    this.peerHandlers.handleOpen(this.peer);
    this.peerHandlers.handleConnection(this.peer);
    this.peerHandlers.handleError(this.peer);
    return peer;
  }
  // 连接到指定的PeerId
  connectToPeer(peerId: string) {
    try {
      if (!this.peer) {
        this.peer = this.initPeer();
      }

      const conn = this.peer.connect(peerId);

      this.conn = conn;

      this.connectionHandlers.handleOpen(conn);
      this.connectionHandlers.handleData(conn);
      this.connectionHandlers.handleError(conn);

    } catch (error) {
      console.error('无法连接对方:', error);
    }
  }
  private connectionHandlers = {
    handleOpen: (conn: DataConnection) => {
      conn.on('open', () => {
        const peerId = conn.peer;
        this.peerStore.setId(peerId);
        this.peerStore.setColor(this.store.isHost() ? CellColor.BLUE : CellColor.RED);
        this.store.setGameState(GameState.PEER_CONNECTED);
        if (this.store.isHost()) {
          this.sendSyncState();
          this.alert.success(`对方[${peerId}]已加入，开始畅聊吧！`);
          console.log(`对方[${peerId}]已加入`);
        } else {
          this.alert.success(`已加入房间[${peerId}]，开始畅聊吧！`);
          console.log(`已加入房间[${peerId}]`);
        }
      });
    },
    handleError: (conn: DataConnection) => {
      conn.on('error', (err) => {
        console.error('连接错误：', err);
      });
    },
    handleData: (conn: DataConnection) => {
      conn.on('data', (data: any) => {
        console.log('收到数据：', data);

        // 如果data是字符串，尝试解析为JSON对象
        if (typeof data === 'string') {
          data = JSON.parse(data) as PeerDataEvent<any>;
        }
        const parsed = data as PeerDataEvent<any>;
        const handler = this.peerDataEventHandlers[parsed.event];
        handler?.(parsed.data);
      });
    },
  };
  private peerHandlers = {
    handleConnection: (peer: Peer) => {
      peer.on('connection', (conn: DataConnection) => {
        this.conn = conn;
        this.connectionHandlers.handleOpen(conn);
        this.connectionHandlers.handleData(conn);
        this.connectionHandlers.handleError(conn);
      });
    },
    handleOpen: (peer: Peer) => {
      peer.on('open', (id: string) => {
        console.log('peer 客户端已实例化，我的PeerId:' + id);
        this.myStore.setId(id);
      });
    },
    handleError: (peer: Peer) => {
      peer.on('error', (err) => {
        console.error('Peer实例化错误', err);
      });
    },
  };

  private handleMoveEvent(data: MoveEventData) {
    // TODO 处理移动事件
    console.log('收到移动事件', data);
    if (data.action === 'select') {
      // 选中棋子
      this.store.setClickedCell(data.fromId);
      return;
    }
    if (data.action === 'unselect') {
      // 取消选中
      this.store.resetClickedCell();
      return;
    }
    if (data.action === 'copy') {
      // 复制棋子
      const cells = this.service.copy({
        action: 'copy',
        fromId: data.fromId,
        toId: data.toId,
        color: data.color,
        cells: this.store.cells(),
      });
      this.store.setCells(cells);
      this.store.infect(data.toId);
      this.store.nextPlayer();
      this.store.resetClickedCell();
      return;
    }
    if (data.action === 'jump') {
      // 跳跃棋子
      const cells = this.service.jump({
        action: 'jump',
        fromId: data.fromId,
        toId: data.toId,
        color: data.color,
        cells: this.store.cells(),
      });
      this.store.setCells(cells);
      this.store.infect(data.toId);
      this.store.nextPlayer();
      this.store.resetClickedCell();

      return;
    }

  }
  private handleReady() {
    this.peerStore.setPlayerState(PlayerState.READY);
  }
  private handleSyncRoomInfo(data: RoomInfo) {
    const { roomName } = data;
    this.store.setRoomName(roomName);
    console.log(`已同步房间信息:${this.store.roomName()}`);
  }

  private peerDataEventHandlers = {
    [PeerEventType.ROOM_INFO]: (data: RoomInfo) => this.handleSyncRoomInfo(data),
    [PeerEventType.READY]: () => this.handleReady(),
    [PeerEventType.MOVE]: (data: MoveEventData) => this.handleMoveEvent(data),

  };

  // 发送Ready事件
  sendReady() {
    const event: PeerDataEvent<null> = {
      event: PeerEventType.READY,
      data: null,
    }
    this.send(event);
  }
  // 发送同步状态
  sendSyncState() {
    // 发送房间信息
    const roomInfo: PeerDataEvent<RoomInfo> = {
      event: PeerEventType.ROOM_INFO,
      data: {
        roomName: this.store.roomName(),
      }
    }
    this.send(roomInfo);
  }
  sendMove(data: MoveEventData) {
    const event: PeerDataEvent<MoveEventData> = {
      event: PeerEventType.MOVE,
      data,
    };
    this.send(event);
  }
  send<T>(data: PeerDataEvent<T>) {
    if (!this.conn) {
      console.log('连接不存在');

      return;
    }
    this.conn.send(JSON.stringify(data));
  }
  // 判断peer是否已实例化
  isPeerInitialized(): boolean {
    return !!this.peer;
  }

  // 判断是否已连接
  isConnected(): boolean {
    return !!this.conn;
  }
  disconnect() {
    if (this.conn) {
      this.conn.close();
    }
    if (this.peer) {
      this.peer.destroy();
    }
  }
}
