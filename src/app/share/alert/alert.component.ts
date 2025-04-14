import { Component } from '@angular/core';
import { Alert } from './alert';
import { AlertService } from './alert.service';

@Component({
  selector: 'app-alert',
  standalone: false,
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.less'
})
export class AlertComponent {
  alerts: Alert[] = [];
  constructor(
    private readonly alertService: AlertService,
  ) {
    this.alertService.getAlert().subscribe(alert => {
      this.alerts.push(alert);

      // 2s后移除提示消息
      setTimeout(() => {
        this.alerts = this.alerts.filter(a => a !== alert);
      }, 2000);
    });
  }

}
