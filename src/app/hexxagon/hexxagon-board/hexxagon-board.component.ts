import { Component, effect, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { HexxagonStore } from '../store/hexxagon.store';
import { CellColor, ClickStep, GameState, MoveEventData, PlayerState } from '../hexxagon.type';
import { MyStore } from '../store/my.store';
import { HexxagonService } from '../service/hexxagon.service';
import { PeerStore } from '../store/peer.store';
import { PeerService } from '../service/peer.service';
import { AlertService } from '../../share/alert/alert.service';
import { AudioService } from '../../audio.service';
@Component({
  selector: 'app-hexxagon-board',
  standalone: false,

  templateUrl: './hexxagon-board.component.html',
  styleUrl: './hexxagon-board.component.less'
})
export class HexxagonBoardComponent implements OnInit {

  CellColor = CellColor;
  GameState = GameState;
  PlayerState = PlayerState;

  private readonly audioService = inject(AudioService);
  private readonly router = inject(Router);
  private readonly store: HexxagonStore = inject(HexxagonStore);
  private readonly myStore: MyStore = inject(MyStore);
  private readonly peerStore: PeerStore = inject(PeerStore);
  private readonly hexxagonService = inject(HexxagonService);
  private readonly peerService = inject(PeerService);
  private readonly alert = inject(AlertService);

  cells = this.store.cells;
  currentPlayer = this.store.currentPlayer;
  redCount = this.store.redCount;
  blueCount = this.store.blueCount;
  winner = this.store.winner;

  myId = this.myStore.id;
  myColor = this.myStore.color;
  myState = this.myStore.playerState;
  peerId = this.peerStore.id;
  peerColor = this.peerStore.color;
  peerState = this.peerStore.playerState;

  redPrecent = this.store.redPrecent;
  bluePrecent = this.store.bluePrecent;

  roomName = this.store.roomName;
  isHost = this.store.isHost;
  gameState = this.store.gameState;

  countdown = 5;
  countdownSub: Subscription | null = null;

  constructor(
  ) {

    // 监听胜利者
    effect(() => {
      // 胜利者
      const winner = this.winner();
    });

    // 当本地Peer初始化成功后，设置游戏状态为等待
    effect(() => {
      if (this.myId()) {
        this.store.setGameState(GameState.WAITING);
      }
    });

    // 监听玩家状态，设置Ready
    effect(() => {
      if (this.myState() === PlayerState.READY && this.peerState() === PlayerState.READY) {
        this.store.setGameState(GameState.READY);
        this.countdownSub = timer(1000, 1000).subscribe(() => {
          if (this.countdown === 0) {
            this.store.setGameState(GameState.STARTED);
            this.myStore.setPlayerState(PlayerState.PLAYING);
            this.peerStore.setPlayerState(PlayerState.PLAYING);
            if (this.countdownSub) {
              this.countdownSub.unsubscribe();
              this.countdownSub = null;
            }
          }
          this.countdown--;
        });
      }

    });
  }

  ngOnInit(): void {
    if (this.store.isHost() === null) {
      this.router.navigate(['/', 'start']);
    }
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

      const operation: MoveEventData = {
        action: 'select',
        fromId: id,
        toId: 0,
        color: this.currentPlayer(),
      };
      this.peerService.sendMove(operation);

      this.playClick();
      this.store.setClickedCell(id);
      this.store.nextStep();
      return;

    } else if (this.store.clickStep() == ClickStep.MOVE) {
      // 再次选中，进行操作

      // 如果点击是同一个单元，取消选中
      if (this.store.clickedId() === id) {
        this.peerService.sendMove({
          action: 'unselect',
          fromId: id,
          toId: 0,
          color: this.currentPlayer(),
        });
        this.store.resetClickedCell();
        return;
      }

      if (cell.color == this.currentPlayer()) {
        this.peerService.sendMove({
          action: 'select',
          fromId: id,
          toId: 0,
          color: this.currentPlayer(),
        });
        this.store.setClickedCell(id);
        return;
      }

      // 检查当前位置是否已放置棋子
      if (cell.color) {
        console.log('当前位置已放置棋子');
        return;
      }

      if (this.store.clickedFirst().includes(id)) {
        const operation: MoveEventData = {
          action: 'copy',
          fromId: this.store.clickedId(),
          toId: id,
          color: this.currentPlayer(),
        };
        this.peerService.sendMove(operation);
        // this.copy(this.store.clickedId(), id);
        const cells = this.hexxagonService.copy({
          action: 'copy',
          fromId: this.store.clickedId(),
          toId: id,
          cells: this.store.cells(),
          color: this.currentPlayer(),
        });

        this.store.setCells(cells);
        this.store.resetClickedCell();
        this.store.infect(id);
        this.store.nextPlayer();
        this.playMove();
        return;
      }

      if (this.store.clickedSecond().includes(id)) {
        const operation: MoveEventData = {
          action: 'jump',
          fromId: this.store.clickedId(),
          toId: id,
          color: this.currentPlayer(),
        };
        this.peerService.sendMove(operation);
        // this.move(this.store.clickedId(), id);
        const cells = this.hexxagonService.jump({
          action: 'jump',
          fromId: this.store.clickedId(),
          toId: id,
          cells: this.store.cells(),
          color: this.currentPlayer(),
        });

        this.store.setCells(cells);
        this.store.resetClickedCell();
        this.store.infect(id);
        this.store.nextPlayer();
        this.playMove();
        return;
      }

    }

    console.log(id);
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

  async playClick() {
    await this.audioService.preload('click', 'assets/audio/hexxagon/click.mp3');
    await this.audioService.play('click');
  }
  async playMove() {
    await this.audioService.preload('move', 'assets/audio/hexxagon/move.mp3');
    await this.audioService.play('move');
  }

  async playWinner() {
    await this.audioService.preload('winner', 'assets/audio/hexxagon/winner.mp3');
    await this.audioService.play('winner');
  }

  ready() {
    this.peerService.sendReady();
    this.myStore.setPlayerState(PlayerState.READY);
  }

  copyToClipboard() {
    // 复制peerId到剪贴板
    navigator.clipboard.writeText(this.myId() || '');
    this.alert.success('复制成功！快发送给你的好友加入聊天室聊天吧！');
  }

}
