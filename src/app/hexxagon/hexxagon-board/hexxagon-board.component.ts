import { Component, effect, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { HexxagonStore } from '../hexxagon.store';
@Component({
  selector: 'app-hexxagon-board',
  standalone: false,

  templateUrl: './hexxagon-board.component.html',
  styleUrl: './hexxagon-board.component.less'
})
export class HexxagonBoardComponent {
  private readonly boardStore: HexxagonStore = inject(HexxagonStore);

  @ViewChild('clickPlayer') clickPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('movePlayer') movePlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('winnerPlayer') winnerPlayer!: ElementRef<HTMLAudioElement>;

  cells = this.boardStore.cells;
  currentPlayer = this.boardStore.currentPlayer;
  player1Count = this.boardStore.player1Count;
  player2Count = this.boardStore.player2Count;
  winner = this.boardStore.winner;

  player1Percent = this.boardStore.player1Percent;
  player2Percent = this.boardStore.player2Percent;

  constructor(
  ) {
    effect(() => {
      if (this.winner() != -1) {
        this.playWinner();
      }
    });
  }

  ngOnInit(): void {
  }

  clickCell(id: number) {

    // 判断是否是可点击的cell
    const cell = this.boardStore.getCellById(id);
    if (!cell) {
      console.log('不是可点击的cell');
      return;
    }

    if (this.boardStore.step() == 0) {
      // 初次点击，选中棋子
      if (!cell.player || cell.player !== this.currentPlayer()) {
        console.log('只能选中自己的棋子');
        return;
      }
      this.playClick();
      this.setClickedCell(id);
      this.boardStore.nextStep();
      return;

    } else if (this.boardStore.step() == 1) {
      // 再次选中，进行操作

      // 如果点击是同一个单元，取消选中
      if (this.boardStore.clickedId() === id) {
        this.resetClickedCell();
        return;
      }

      if (cell.player == this.currentPlayer()) {
        this.setClickedCell(id);
        return;
      }

      // 检查当前位置是否已放置棋子
      if (cell.player) {
        console.log('当前位置已放置棋子');
        return;
      }

      if (this.boardStore.clickedFirst().includes(id)) {
        this.copy(this.boardStore.clickedId(), id);
        this.resetClickedCell();
        this.infect(id);
        this.nextPlayer();
        this.playMove();
        return;
      }

      if (this.boardStore.clickedSecond().includes(id)) {
        this.move(this.boardStore.clickedId(), id);
        this.resetClickedCell();
        this.infect(id);
        this.nextPlayer();
        this.playMove();
        return;
      }

    }

    console.log(id);
  }


  // 设置第一次被点击的cell
  setClickedCell(id: number) {
    // 设置第一次点击的ID
    this.boardStore.setClickedId(id);
    // 高亮被点击的cell的相邻cell
    const first = this.boardStore.first.get(id);
    const second = this.boardStore.second.get(id);
    const clickedFirst = [], clickedSecond = [];
    for (const cell of this.cells()) {
      for (const c of cell) {
        // 选中当前点击的单元格
        if (c.id === id) {
          c.selected = true;
        } else {
          c.selected = false;
        }
        // 标记相邻单元格
        if (first?.includes(c.id)) {
          c.first = true;
          clickedFirst.push(c.id);
        } else {
          c.first = false;
        }
        if (second?.includes(c.id)) {
          clickedSecond.push(c.id);
          c.second = true;
        } else {
          c.second = false;
        }
        this.boardStore.updateCellById(c.id, c);
      }
    }
    this.boardStore.clickedFirst.set(clickedFirst);
    this.boardStore.clickedSecond.set(clickedSecond);
  }

  // 重置被点击的cell，取消相邻cell的高亮
  resetClickedCell() {
    this.boardStore.clickedId.set(0);
    this.boardStore.clickedFirst.set([]);
    this.boardStore.clickedSecond.set([]);
    this.boardStore.step.set(0);
    for (const arr of this.boardStore.cells()) {
      for (const cell of arr) {
        cell.first = false;
        cell.second = false;
        cell.selected = false;

        this.boardStore.updateCellById(cell.id, cell);
      }
    }
  }

  resetBoard() {
    this.boardStore.initState();
  }

  move(fromId: number, toId: number) {
    console.log('move', fromId, toId);
    const fromCell = this.boardStore.availableCells().get(fromId);
    const toCell = this.boardStore.availableCells().get(toId);
    if (fromCell?.player !== this.currentPlayer()) {
      console.log('只能移动自己的棋子');
      return;
    }
    if (toCell?.player) {
      console.log('目标位置已有棋子');
      return;
    }

    fromCell.player = undefined;
    toCell!.player = this.currentPlayer();

  }

  copy(fromId: number, toId: number) {
    console.log('copy', fromId, toId);
    const fromCell = this.boardStore.availableCells().get(fromId);
    const toCell = this.boardStore.availableCells().get(toId);
    if (!fromCell || !toCell) {
      console.log('fromCell or toCell is null');
      return;
    }
    if (fromCell?.player !== this.currentPlayer()) {
      console.log('只能复制自己的棋子');
      return;
    }
    if (toCell?.player) {
      console.log('目标位置已有棋子');
      return;
    }

    toCell!.player = this.currentPlayer();

    this.boardStore.updateCellById(fromId, fromCell);
    this.boardStore.updateCellById(toId, toCell!);

  }

  nextPlayer() {
    this.boardStore.currentPlayer.set(this.boardStore.currentPlayer() == 1 ? 2 : 1);
  }

  infect(id: number) {
    const first = this.boardStore.first.get(id);
    if (!first) {
      return;
    }
    for (const f of first) {
      const cell = this.boardStore.getCellById(f);
      if (!cell) {
        continue;
      }
      const player = this.boardStore.currentPlayer();
      if (cell.player) {
        cell.player = player;
        this.boardStore.updateCellById(f, cell);
      }
    }
  }

  playClick() {
    this.clickPlayer.nativeElement.play();
  }
  playMove() {
    this.movePlayer.nativeElement.play();
  }

  playWinner() {
    this.winnerPlayer.nativeElement.play();
  }



}
