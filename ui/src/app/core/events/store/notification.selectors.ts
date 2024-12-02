import { createSelector, createFeatureSelector } from '@ngrx/store';
import { NotificationState } from './notification.reducer';

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
  (state) => id.map((id) => state.events.eventRecords[id])
)

export const selectLastEvent = createSelector(
  selectNotificationState,
  (state) => {
    if (state.events.idList.length === 0) return null;
    else return state.events.eventRecords[state.events.idList[state.events.idList.length - 1]];
  }
);

export const selectEvents = createSelector(
  selectNotificationState,
  (state) => state.events.idList.map((id) => state.events.eventRecords[id])
);