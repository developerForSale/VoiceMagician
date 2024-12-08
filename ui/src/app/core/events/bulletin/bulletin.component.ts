import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { EventBubbleComponent } from '../event-bubble/event-bubble.component';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectEvents, selectRSVeEventGroupByIds } from '../store/notification.selectors';
import { NotificationState, RSVePhaseNode } from '../store/notification.reducer';


@Component({
    selector: 'app-bulletin',
    imports: [
      EventBubbleComponent,
      AsyncPipe,
      JsonPipe,
      MatIconModule,
      MatTabsModule,
    ],
    templateUrl: './bulletin.component.html',
    styleUrl: './bulletin.component.css'
})
export class BulletinComponent {
  public events$ = this.store.select(selectEvents);
  public expandedGroups: string[] = [];
  public expandedGroups$: Observable<RSVePhaseNode[]> = this.store.select(selectRSVeEventGroupByIds(this.expandedGroups));
  tabSelected = new FormControl(0);

  constructor(private store: Store<NotificationState>) {}

  expandGroup(group: string) {
    if (this.expandedGroups.includes(group)) {
      this.tabSelected.setValue(this.expandedGroups.indexOf(group) + 1);
    } else {
      this.expandedGroups.push(group);
      this.tabSelected.setValue(this.expandedGroups.length);
    }
  }

  closeTab(index: number) {
    this.expandedGroups.splice(index, 1);
    this.tabSelected.setValue(index)
  }
}
