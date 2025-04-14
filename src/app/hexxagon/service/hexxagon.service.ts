import { inject, Injectable } from "@angular/core";
import { ActionOperation, BoardCell } from "../hexxagon.type";
import { Tools } from "./tools.service";

@Injectable({
  providedIn: 'root'
})
export class HexxagonService {

  readonly tools = inject(Tools);

  // 临近一层的格子
  copy(actionOperation: ActionOperation): BoardCell[][] {
    const { cells, fromId, toId, color } = actionOperation;
    const fromCell = cells.flat().find(cell => cell.id === fromId);
    const toCell = cells.flat().find(cell => cell.id === toId);
    if (!fromCell || !toCell) {
      console.error('棋子不能为空');
      return cells;
    }
    if (fromCell.color !== color) {
      console.error('只能复制自己的棋子');
      return cells;
    }
    if (toCell.color) {
      console.error('目标位置已有棋子');
      return cells;
    }

    toCell.color = color;

    return this.tools.deepClone(cells);
  }

  // 临近两层的格子
  move(actionOperation: ActionOperation): BoardCell[][] {
    const { cells, fromId, toId, color } = actionOperation;
    const fromCell = cells.flat().find(cell => cell.id === fromId);
    const toCell = cells.flat().find(cell => cell.id === toId);
    if (!fromCell || !toCell) {
      console.error('棋子不能为空');
      return cells;
    }

    if (fromCell.color != color) {
      console.error('只能移动自己的棋子');
      return cells;
    }

    if (toCell.color) {
      console.error('目标位置已有棋子');
      return cells;
    }

    fromCell.color = undefined;
    toCell.color = color;

    return this.tools.deepClone(cells);

  }

}
