import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../../share/alert/alert.service';
import { MyStore } from '../store/my.store';
import { PeerStore } from '../store/peer.store';
import { CellColor, GameState } from '../hexxagon.type';
import { HexxagonStore } from '../store/hexxagon.store';
import { PeerService } from '../service/peer.service';

@Component({
  selector: 'app-start',
  standalone: false,

  templateUrl: './start.component.html',
  styleUrl: './start.component.css'
})
export class StartComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly alert = inject(AlertService);
  private readonly store = inject(HexxagonStore);
  private readonly myStore = inject(MyStore);
  private readonly peerStore = inject(PeerStore);
  private readonly peerService = inject(PeerService);

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
    this.peerService.connectToPeer(this.peerId);

    this.router.navigate(['/', 'board']);
  }

}
