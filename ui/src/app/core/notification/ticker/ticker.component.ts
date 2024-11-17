import { Component, Input } from '@angular/core';

import { Store } from '@ngrx/store';
import { BulletinActions } from './store/notification.actions';
import { SSEActions } from './store/notification.actions';
import { NotificationState } from './store/notification.reducer';

@Component({
  selector: 'app-ticker',
  standalone: true,
  imports: [],
  templateUrl: './ticker.component.html',
  styleUrl: './ticker.component.css',
})
export class TickerComponent {
  @Input() event: any;

  onClick() {
    this.store.dispatch(SSEActions.unfold());
  }
}
