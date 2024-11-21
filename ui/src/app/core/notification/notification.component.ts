import { Component } from '@angular/core';
import { AsyncPipe} from '@angular/common';
import { EventSourceService } from './event-source.service';
import { Subscription } from 'rxjs';

import { TickerComponent } from './ticker/ticker.component';
import { BulletinComponent } from './bulletin/bulletin.component';
import { API_PATH } from '../../env';
import { Store } from '@ngrx/store';
import { SSEActions } from './store/notification.actions';
import { EventType, NotificationState } from './store/notification.reducer';
import { selectIsBulletinShown } from './store/notification.selectors';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [TickerComponent, BulletinComponent, AsyncPipe],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationComponent {
  private readonly eventSourceSubscription: Subscription;
  isBulletinShown$ = this.store.select(selectIsBulletinShown)

  constructor(
    private eventSourceService: EventSourceService,
    private store: Store<NotificationState>
  ) {
    const url = API_PATH.SUBSCRIBE_NOTIFICATION;
    const options = { withCredentials: false };
    const eventNames: string[] = [];

    this.eventSourceSubscription = this.eventSourceService
      .connectToServerSentEvents(url, options, eventNames)
      .subscribe({
        next: (event: EventType) => {
          this.store.dispatch(SSEActions.eventReceived({ event }));
        },
        error: (error) => {
          this.store.dispatch(SSEActions.errorAlarm({ error }));
        },
      });
  }

  ngOnDestroy(): void {
    this.eventSourceSubscription.unsubscribe();
    this.eventSourceService.close();
  }
}
