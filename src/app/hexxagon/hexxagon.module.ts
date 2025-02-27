import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HexxagonRoutingModule } from './hexxagon-routing.module';
import { HexxagonStore } from './hexxagon.store';
import { HexxagonBoardComponent } from './hexxagon-board/hexxagon-board.component';
import { CellComponent } from './cell/cell.component';
import { PlayerCellComponent } from './player-cell/player-cell.component';


@NgModule({
  declarations: [
    HexxagonBoardComponent,
    CellComponent,
    PlayerCellComponent
  ],
  imports: [
    CommonModule,
    HexxagonRoutingModule,
  ],
  providers: [
    HexxagonStore,
  ]
})
export class HexxagonModule { }
