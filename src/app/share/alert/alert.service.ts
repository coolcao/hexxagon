import { Injectable } from "@angular/core";
import { Subject, throttleTime } from "rxjs";
import { Alert } from "./alert";

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private subject = new Subject<Alert>();

  getAlert() {
    return this.subject.pipe(throttleTime(500));
  }

  info(msg: string) {
    this.subject.next({ msg, type: 'info' });
  }

  success(msg: string) {
    this.subject.next({ msg, type: 'success' });
  }

  warning(msg: string) {
    this.subject.next({ msg, type: 'warning' });
  }

  error(msg: string) {
    this.subject.next({ msg, type: 'error' });
  }
}
