import { Component, effect, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { HexxagonStore } from '../store/hexxagon.store';
import { CellColor, ClickStep } from '../hexxagon.type';
import { MyStore } from '../store/my.store';
import { HexxagonService } from '../service/hexxagon.service';
import { PeerStore } from '../store/peer.store';
@Component({
  selector: 'app-hexxagon-board',
  standalone: false,

  templateUrl: './hexxagon-board.component.html',
  styleUrl: './hexxagon-board.component.less'
})
export class HexxagonBoardComponent {

  CellColor = CellColor;

  private readonly store: HexxagonStore = inject(HexxagonStore);
  private readonly myStore: MyStore = inject(MyStore);
  private readonly peerStore: PeerStore = inject(PeerStore);
  private readonly hexxagonService = inject(HexxagonService);

  @ViewChild('clickPlayer') clickPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('movePlayer') movePlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('winnerPlayer') winnerPlayer!: ElementRef<HTMLAudioElement>;

  cells = this.store.cells;
  currentPlayer = this.store.currentPlayer;
  redCount = this.store.redCount;
  blueCount = this.store.blueCount;
  winner = this.store.winner;

  myId = this.myStore.id;
  myColor = this.myStore.color;
  peerId = this.peerStore.id;
  peerColor = this.peerStore.color;

  redPrecent = this.store.redPrecent;
  bluePrecent = this.store.bluePrecent;

  constructor(
  ) {
    effect(() => {
      if (this.winner() == this.myStore.id()) {
        this.playWinner();
      }
      if (this.winner() == this.peerStore.id()) {
        // 播放失败音乐
      }
    });
  }

  ngOnInit(): void {
  }

  clickCell(id: number) {

    // 判断是否是可点击的cell
    const cell = this.store.getCellById(id);
    if (!cell) {
      console.log('不是可点击的cell');
      return;
    }

    if (this.currentPlayer() != this.myStore.color()) {
      console.log('不是自己的回合');
      return;
    }

    if (this.store.clickStep() == ClickStep.SELECT) {
      // 初次点击，选中棋子
      if (!cell.color || cell.color !== this.currentPlayer()) {
        console.log('只能选中自己的棋子');
        return;
      }
      this.playClick();
      this.setClickedCell(id);
      this.store.nextStep();
      return;

    } else if (this.store.clickStep() == ClickStep.MOVE) {
      // 再次选中，进行操作

      // 如果点击是同一个单元，取消选中
      if (this.store.clickedId() === id) {
        this.resetClickedCell();
        return;
      }

      if (cell.color == this.currentPlayer()) {
        this.setClickedCell(id);
        return;
      }

      // 检查当前位置是否已放置棋子
      if (cell.color) {
        console.log('当前位置已放置棋子');
        return;
      }

      if (this.store.clickedFirst().includes(id)) {
        // this.copy(this.store.clickedId(), id);
        const cells = this.hexxagonService.copy({
          action: 'copy',
          fromId: this.store.clickedId(),
          toId: id,
          cells: this.store.cells(),
          color: this.currentPlayer(),
        });

        this.store.setCells(cells);
        this.resetClickedCell();
        this.infect(id);
        this.nextPlayer();
        this.playMove();
        return;
      }

      if (this.store.clickedSecond().includes(id)) {
        // this.move(this.store.clickedId(), id);
        const cells = this.hexxagonService.move({
          action: 'move',
          fromId: this.store.clickedId(),
          toId: id,
          cells: this.store.cells(),
          color: this.currentPlayer(),
        });

        this.store.setCells(cells);
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
    this.store.setClickedId(id);
    // 高亮被点击的cell的相邻cell
    const first = this.store.first.get(id);
    const second = this.store.second.get(id);
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
        this.store.updateCellById(c.id, c);
      }
    }
    this.store.setClickedFirst(clickedFirst);
    this.store.setClickedSecond(clickedSecond);
  }

  // 重置被点击的cell，取消相邻cell的高亮
  resetClickedCell() {
    this.store.setClickedId(0);
    this.store.setClickedFirst([]);
    this.store.setClickedSecond([]);
    this.store.setClickStep(ClickStep.SELECT);
    for (const arr of this.store.cells()) {
      for (const cell of arr) {
        cell.first = false;
        cell.second = false;
        cell.selected = false;

        this.store.updateCellById(cell.id, cell);
      }
    }
  }

  resetBoard() {
    this.store.initState();
  }

  move(fromId: number, toId: number) {
    console.log('move', fromId, toId);
    const fromCell = this.store.availableCells().get(fromId);
    const toCell = this.store.availableCells().get(toId);
    if (fromCell?.color !== this.currentPlayer()) {
      console.log('只能移动自己的棋子');
      return;
    }
    if (toCell?.color) {
      console.log('目标位置已有棋子');
      return;
    }

    fromCell.color = undefined;
    toCell!.color = this.currentPlayer();

  }

  copy(fromId: number, toId: number) {
    console.log('copy', fromId, toId);
    const fromCell = this.store.availableCells().get(fromId);
    const toCell = this.store.availableCells().get(toId);
    if (!fromCell || !toCell) {
      console.log('fromCell or toCell is null');
      return;
    }
    if (fromCell?.color !== this.currentPlayer()) {
      console.log('只能复制自己的棋子');
      return;
    }
    if (toCell?.color) {
      console.log('目标位置已有棋子');
      return;
    }

    toCell!.color = this.currentPlayer();

    this.store.updateCellById(fromId, fromCell);
    this.store.updateCellById(toId, toCell!);

  }

  nextPlayer() {
    this.store.setCurrentPlayer(this.store.currentPlayer() == CellColor.RED ? CellColor.BLUE : CellColor.RED);
  }

  infect(id: number) {
    const first = this.store.first.get(id);
    if (!first) {
      return;
    }
    for (const f of first) {
      const cell = this.store.getCellById(f);
      if (!cell) {
        continue;
      }
      const player = this.store.currentPlayer();
      if (cell.color) {
        cell.color = player;
        this.store.updateCellById(f, cell);
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
