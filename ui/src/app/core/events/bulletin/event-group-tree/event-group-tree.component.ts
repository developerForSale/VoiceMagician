import { Component, Input } from '@angular/core';

import { map, Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTreeModule } from '@angular/material/tree';
import { Store } from '@ngrx/store';
import {
  NotificationState,
  RSVePhaseNode,
} from '../../store/notification.reducer';
import { selectRSVeEventGroupById } from '../../store/notification.selectors';

@Component({
  selector: 'app-event-group-tree',
  imports: [MatTreeModule, MatButtonModule, MatIconModule],
  templateUrl: './event-group-tree.component.html',
  styleUrl: './event-group-tree.component.css',
})
export class EventGroupTreeComponent {
  @Input() groupId!: string;
  private groupRootNode$!: Observable<RSVePhaseNode>;
  public dataSource$!: Observable<RSVePhaseNode[]>;
  public childrenAccessor = (node: RSVePhaseNode) => {
    const children: RSVePhaseNode[] = [];
    if (node.subPhase !== null) {
      children.push(node.subPhase);
      let currentSibling = node.subPhase.nextPhase;
      while (currentSibling !== null) {
        children.push(currentSibling);
        currentSibling = currentSibling.nextPhase;
      }
    }
    return children;
  };
  public hasChild = (_: number, node: RSVePhaseNode) => node.subPhase !== null;
  
  constructor(private store: Store<NotificationState>) {}

  ngOnInit() {
    this.groupRootNode$ = this.store.select(
      selectRSVeEventGroupById(this.groupId)
    );
    this.dataSource$ = this.groupRootNode$.pipe(
      map((node: RSVePhaseNode) => this.childrenAccessor(node))
    );
  }
}
