import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScatterFlowersComponent } from './scatter-flowers/scatter-flowers.component';
import { AlertComponent } from './alert/alert.component';



@NgModule({
  declarations: [
    ScatterFlowersComponent,
    AlertComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ScatterFlowersComponent,
    AlertComponent,
  ]
})
export class ShareModule { }
