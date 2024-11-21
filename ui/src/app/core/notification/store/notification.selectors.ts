import { createSelector, createFeatureSelector } from '@ngrx/store';
import { EventType, NotificationState } from './notification.reducer';

const selectNotificationState =
  createFeatureSelector<NotificationState>('notification');

export const selectIsBulletinShown = createSelector(
  selectNotificationState,
  (state) => state.isBulletinShown
);

export const selectAlarmIds = createSelector(
  selectNotificationState,
  (state) => state.alarmIds
)

export const selectEventByIds = (id: string[]) => createSelector(
  selectNotificationState,
  (state) => state.events.filter((event) => id.includes(event.id))
)

export const selectLastEvent = createSelector(
  selectNotificationState,
  (state) => {
    if (state.events.length === 0) return null;
    else return state.events[state.events.length - 1];
  }
);

export const selectEvents = createSelector(
  selectNotificationState,
  (state) => state.events
);