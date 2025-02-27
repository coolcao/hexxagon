import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BoardCell } from '../hexxagon.type';

@Component({
  selector: 'app-cell',
  standalone: false,

  templateUrl: './cell.component.html',
  styleUrl: './cell.component.less'
})
export class CellComponent {

  @Input()
  cell: BoardCell | null = null;

  @Output()
  onClick: EventEmitter<number> = new EventEmitter<number>();

  click() {
    if (!this.cell) {
      return;
    }
    this.onClick.emit(this.cell.id);
  }

  showPointer() {
    return this.cell && this.cell.show;
  }

  getBgClass(): string {

    // 隐藏单元格
    if (!this.cell || !this.cell.show) {
      return 'dark:bg-gray-800 bg-white';
    }

    // 当前已被选中的单元格
    if (this.cell.selected && !this.cell.first && !this.cell.second) {
      return 'bg-green-800 dark:bg-green-500';
    }

    // 相邻单元格
    if (this.cell.first && !this.cell.player) {
      return 'bg-green-600 dark:bg-green-300';
    }
    // 第二组相邻单元格
    if (this.cell.second && !this.cell.player) {
      return 'bg-green-400 dark:bg-green-200';
    }
    // 默认样式
    return 'bg-purple-500 dark:bg-gray-300';
  }

}
