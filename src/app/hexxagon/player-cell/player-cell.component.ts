import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { Component, Input } from '@angular/core';
const frames = [
  style({ transform: 'translate3d(-1px, 0, 0)', offset: 0.1 }),
  style({ transform: 'translate3d(2px, 0, 0)', offset: 0.2 }),
  style({ transform: 'translate3d(-4px, 0, 0)', offset: 0.3 }),
  style({ transform: 'translate3d(4px, 0, 0)', offset: 0.4 }),
  style({ transform: 'translate3d(-4px, 0, 0)', offset: 0.5 }),
  style({ transform: 'translate3d(4px, 0, 0)', offset: 0.6 }),
  style({ transform: 'translate3d(-4px, 0, 0)', offset: 0.7 }),
  style({ transform: 'translate3d(4px, 0, 0)', offset: 0.8 }),
  style({ transform: 'translate3d(-2px, 0, 0)', offset: 0.9 }),
  style({ transform: 'translate3d(1px, 0, 0)', offset: 1.0 })
];
@Component({
  selector: 'app-player-cell',
  standalone: false,

  templateUrl: './player-cell.component.html',
  styleUrl: './player-cell.component.less',
  animations: [
    trigger('showBall', [
      state('blue', style({
        width: '60%',
        height: '60%',
        background: 'radial-gradient(#1e76fa, #0000ff)',
        backgroundSize: '100% 100%',
        backgroundPosition: '50% 50%',
        borderRadius: '50%',
        boxShadow: '0 0 10px 2px rgba(255, 255, 255, 0.5)'
      })),
      state('red', style({
        width: '60%',
        height: '60%',
        background: 'radial-gradient(#ff0000, #9d0000)',
        backgroundSize: '100% 100%',
        backgroundPosition: '50% 50%',
        borderRadius: '40%',
        boxShadow: '0 0 10px 2px rgba(255, 255, 255, 0.5)',
      })),
      state('hidden', style({

      })),
      transition('blue => red', [
        animate('1s ease', keyframes(frames))
      ]),
      transition('blue => hidden', [
        animate('0.1s ease', keyframes(frames))
      ]),
      transition('red => blue', [
        animate('1s ease', keyframes(frames))
      ]),
      transition('red => hidden', [
        animate('0.1s ease', keyframes(frames))
      ]),
      transition('hidden => red', [
        animate('0.5s ease', keyframes(frames))
      ]),
      transition('hidden => blue', [
        animate('0.5s ease', keyframes(frames))
      ])
    ]),
  ]
})
export class PlayerCellComponent {
  @Input()
  player: 1 | 2 | undefined = undefined;

  @Input()
  id: number = 0;
}
