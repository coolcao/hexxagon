import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HexxagonBoardComponent } from './hexxagon-board/hexxagon-board.component';

const routes: Routes = [
  { path: '', component: HexxagonBoardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HexxagonRoutingModule { }
