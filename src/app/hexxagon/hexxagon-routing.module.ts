import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HexxagonBoardComponent } from './hexxagon-board/hexxagon-board.component';
import { StartComponent } from './start/start.component';

const routes: Routes = [
  { path: '', redirectTo: 'start', pathMatch: 'full' },
  { path: 'start', component: StartComponent },
  { path: 'board', component: HexxagonBoardComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HexxagonRoutingModule { }
