import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AsyncPipe} from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { EventBubbleComponent } from '../event-bubble/event-bubble.component';

import { Store } from '@ngrx/store';
import { selectEvents } from '../store/notification.selectors';
import { NotificationState } from '../store/notification.reducer';
import { BulletinActions } from '../store/notification.actions';

@Component({
    selector: 'app-bulletin',
    imports: [
      EventBubbleComponent,
      AsyncPipe,
      MatIconModule,
      MatTabsModule,
    ],
    templateUrl: './bulletin.component.html',
    styleUrl: './bulletin.component.css'
})
export class BulletinComponent {
  public events$ = this.store.select(selectEvents);
  public expandedGroups: string[] = [];
  //public expandedGroups$ = this.store.select(selectExpandedEventGroups);
  eventsPanelSelected = new FormControl(0);

  constructor(private store: Store<NotificationState>) {}

  expandGroup(group: string) {
    this.store.dispatch(BulletinActions.expandEventGroup({ groupId: group }));
    this.expandedGroups.push(group);
    this.eventsPanelSelected.setValue(this.expandedGroups.length);
  }

  closeTab(index: number) {
    this.store.dispatch(BulletinActions.closeEventGroupTab({ groupId: this.expandedGroups[index] }));
    this.expandedGroups.splice(index, 1);
    this.eventsPanelSelected.setValue(index)
  }
}
