import { Injectable, signal } from "@angular/core";
import { CellColor, PlayerState } from "../hexxagon.type";

@Injectable({
  providedIn: 'root'
})
export class PeerStore {
  constructor() { }

  private _peerId = signal('');      // 对方ID
  private _peerReady = signal(false);// 对方是否已准备好
  private _color = signal<CellColor | undefined>(undefined);
  private _playerState = signal<PlayerState>(PlayerState.INITIAL);

  readonly id = this._peerId.asReadonly();
  readonly ready = this._peerReady.asReadonly();
  readonly color = this._color.asReadonly();
  readonly playerState = this._playerState.asReadonly()

  setId(id: string) {
    this._peerId.set(id);
  }

  setReady(ready: boolean) {
    this._peerReady.set(ready);
  }
  setColor(color: CellColor) {
    this._color.set(color);
  }

  setPlayerState(state: PlayerState) {
    this._playerState.set(state);
  }
}
