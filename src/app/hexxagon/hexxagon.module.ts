import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HexxagonRoutingModule } from './hexxagon-routing.module';
import { HexxagonStore } from './store/hexxagon.store';
import { HexxagonBoardComponent } from './hexxagon-board/hexxagon-board.component';
import { CellComponent } from './cell/cell.component';
import { PlayerCellComponent } from './player-cell/player-cell.component';
import { StartComponent } from './start/start.component';


@NgModule({
  declarations: [
    HexxagonBoardComponent,
    CellComponent,
    PlayerCellComponent,
    StartComponent
  ],
  imports: [
    CommonModule,
    HexxagonRoutingModule,
    FormsModule,
  ],
  providers: [
  ]
})
export class HexxagonModule { }
