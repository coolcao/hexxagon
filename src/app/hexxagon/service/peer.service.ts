import { inject, Injectable } from "@angular/core";
import Peer, { DataConnection } from 'peerjs';
import { CellColor, PeerDataEvent, PeerEventType, RoomInfo } from "../hexxagon.type";
import { HexxagonStore } from "../store/hexxagon.store";
import { MyStore } from "../store/my.store";
import { PeerStore } from "../store/peer.store";
import { AlertService } from "../../share/alert/alert.service";

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

  private handleSyncRoomInfo(data: RoomInfo) {
    const { roomName } = data;
    this.store.setRoomName(roomName);
    console.log(`已同步房间信息:${this.store.roomName()}`);
  }

  private peerDataEventHandlers = {
    [PeerEventType.ROOM_INFO]: (data: RoomInfo) => this.handleSyncRoomInfo(data),
    [PeerEventType.READY]: () => {
    },
    [PeerEventType.MOVE]: () => {
    },

  };

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
