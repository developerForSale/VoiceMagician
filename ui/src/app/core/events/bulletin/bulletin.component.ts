import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { EventBubbleComponent } from './event-bubble/event-bubble.component';

import { Store } from '@ngrx/store';
import { selectEvents } from '../store/notification.selectors';
import { NotificationState } from '../store/notification.reducer';
import { EventGroupTreeComponent } from "./event-group-tree/event-group-tree.component";


@Component({
    selector: 'app-bulletin',
    imports: [
    EventBubbleComponent,
    AsyncPipe,
    MatIconModule,
    MatTabsModule,
    EventGroupTreeComponent
],
    templateUrl: './bulletin.component.html',
    styleUrl: './bulletin.component.css'
})
export class BulletinComponent {
  public events$ = this.store.select(selectEvents);
  public expandedGroupsOfEventPanel: string[] = [];
  public expandedGroupMapOfEventPanel: Record<string, {info: string, index: number}> = {};
  tabSelected = new FormControl(0);

  constructor(private store: Store<NotificationState>) {}

  expandGroup($event: string) {
    var event = JSON.parse($event);
    if (this.expandedGroupsOfEventPanel.includes(event.group)) {
      this.tabSelected.setValue(this.expandedGroupsOfEventPanel.indexOf(event.group));
    } else {
      this.expandedGroupsOfEventPanel.push(event.group);
      this.expandedGroupMapOfEventPanel[event.group] = {
        info: event.info, index: event.index,
      };
      this.tabSelected.setValue(this.expandedGroupsOfEventPanel.length);
    }
  }

  closeTab(index: number) {
    this.expandedGroupsOfEventPanel.splice(index, 1);
    this.tabSelected.setValue(index)
  }
}
