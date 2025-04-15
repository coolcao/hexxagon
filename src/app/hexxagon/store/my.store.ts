import { Injectable, signal } from "@angular/core";
import { CellColor } from "../hexxagon.type";

@Injectable({
  providedIn: 'root'
})
export class MyStore {
  constructor() { }

  private _id = signal('');        // 我方ID
  private _ready = signal(false);  // 我方是否已准备好
  private _color = signal<CellColor | undefined>(undefined);

  readonly id = this._id.asReadonly();
  readonly ready = this._ready.asReadonly();
  readonly color = this._color.asReadonly();


  setReady(ready: boolean) {
    this._ready.set(ready);
  }
  setId(id: string) {
    this._id.set(id);
  }
  setColor(color: CellColor) {
    this._color.set(color);
  }
}
