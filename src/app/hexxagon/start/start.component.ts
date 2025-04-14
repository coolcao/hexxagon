import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../../share/alert/alert.service';
import { MyStore } from '../store/my.store';
import { PeerStore } from '../store/peer.store';
import { CellColor, GameState } from '../hexxagon.type';
import { HexxagonStore } from '../store/hexxagon.store';

@Component({
  selector: 'app-start',
  standalone: false,

  templateUrl: './start.component.html',
  styleUrl: './start.component.css'
})
export class StartComponent implements OnInit {

  readonly router = inject(Router);
  readonly alert = inject(AlertService);
  readonly store = inject(HexxagonStore);
  readonly myStore = inject(MyStore);
  readonly peerStore = inject(PeerStore);

  showJoin = false;
  peerId = '';


  ngOnInit(): void {
  }

  createRoom() {

    this.store.setIsHost(true);
    this.store.setGameState(GameState.INITIAL);
    this.myStore.setColor(CellColor.RED);

    this.router.navigate(['/', 'board']);
  }

  joinRoom() {
    if (!this.peerId) {
      this.alert.error('请输入PeerID!');
      return;
    }

    this.store.setIsHost(false);
    this.store.setGameState(GameState.INITIAL);
    this.myStore.setColor(CellColor.BLUE);

    this.showJoin = false;

    this.router.navigate(['/', 'board']);
  }

}
