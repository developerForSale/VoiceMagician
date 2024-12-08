import { cloneDeep, create } from 'lodash';

import { createReducer, on } from '@ngrx/store';
import { SSEActions } from './notification.actions';

/**
 * Data format of events receive from SSE.
 */
type RSVeEvent = {
  info: string;
  // type: 'plain' or 'progress'
  type: string;
  // Phases like: 0, 1, 2, 3, 3.1, 3.2, 3.2.1, etc.
  RSVePhase: string;
  // Id of the group this event belongs to.
  group: string;
};

export const errorLevel = '40';

export type EventType = {
  event: any;
  level: string;
  id: string;
};

/**
 * Data structure of RSV executor events store.
 */
export type RSVePhaseNode = {
  phase: string;
  // nexPhase means 0 -> 1 or 1.1 -> 1.2, it's not always obeying the sequence.
  nextPhase: RSVePhaseNode | null;
  // First sub phase: 0.1 or 0.2, 0.3, etc under phase 0
  subPhase: RSVePhaseNode | null;
  // Id list of events tagged for this phase,
  // It also sorts the events in order of time (earliest to latest)
  events: string[] | null;
};

/**
 * NgRx store data structure.
 */
export type EventRecord = {
  event: any;
  level: string;
};

export interface NotificationState {
  isSubscribed: boolean;
  isBulletinShown: boolean;
  alarmIds: string[];
  events: {
    // Id list of all events we have received (earliest to latest)
    idList: string[];
    // All events' detail, using eventId as key
    eventRecords: Record<string, EventRecord>;
    // RSVe events organized by group, using groupId as key
    RSVeEventGroups: Record<string, RSVePhaseNode>;
    // For firstly received RSVe event of each group, mapping groupId to its index in idList
    RSVeEventGroupIndexMap: Record<string, number>;
  };
}

export const initialState: NotificationState = {
  isSubscribed: false,
  isBulletinShown: false,
  alarmIds: [],
  events: {
    idList: [],
    eventRecords: {},
    RSVeEventGroups: {},
    RSVeEventGroupIndexMap: {},
  },
};

export const notificationReducer = createReducer(
  initialState,
  on(SSEActions.eventReceived, (state, { event }) => {
    if (isRSVeEvent(event.event)) {
      return {
        ...state,
        events: addNewRSVeEvent(state.events, event),
      };
    } else {
      return {
        ...state,
        events: {
          ...state.events,
          idList: [...state.events.idList, event.id],
          eventRecords: {
            ...state.events.eventRecords,
            [event.id]: {
              event: event.event,
              level: event.level,
            },
          },
        },
      };
    }
  }),
  on(SSEActions.errorAlarm, (state, { error }) => ({
    ...state,
    events: {
      ...state.events,
      idList: [...state.events.idList, error.id],
      eventRecords: {
        ...state.events.eventRecords,
        [error.id]: {
          event: error.event,
          level: error.level,
        },
      },
    },
    alarmIds: [...state.alarmIds, error.id],
  })),
  on(SSEActions.stopAlarm, (state, { errorId }) => ({
    ...state,
    alarmIds: state.alarmIds.filter((id) => id !== errorId),
  }))
);

function isRSVeEvent(event: string | RSVeEvent): event is RSVeEvent {
  return typeof event === 'object' && 'RSVePhase' in event;
}

function addNewRSVeEvent(
  events: NotificationState['events'],
  event: EventType
): NotificationState['events'] {
  const isFirstEventOfNewGroup: boolean =
    !events.RSVeEventGroups.hasOwnProperty(event.event.group);
  const isProgressEvent: boolean = event.event.type === 'progress';
  var oldProgressEventId: string | null = null;

  // First we find the right node of the group to add the event
  var group: RSVePhaseNode;
  if (events.RSVeEventGroups.hasOwnProperty(event.event.group)) {
    // If the group already exists, find the right node to add the event.
    var group = cloneDeep(events.RSVeEventGroups[event.event.group]);
    var node = findOrCreateTheNode(group, event.event.RSVePhase);
    if (node.events === null) node.events = [event.id];
    else {
      if (isProgressEvent) {
        // If new one is a progress event, Check if there is old one or not.
        for (let eventId of node.events) {
          if (events.eventRecords[eventId].event.type === 'progress') {
            oldProgressEventId = eventId;
            break;
          }
        }
        if (oldProgressEventId !== null) {
          // If there is old one, replace it with the new one.
          node.events = node.events.map((id) => {
            if (id === oldProgressEventId) {
              return event.id;
            } else {
              return id;
            }
          });
        }
      }
      if (oldProgressEventId === null) node.events.push(event.id);
    }
  } else {
    // Create a new group if the group does not exist.
    group = {
      phase: event.event.RSVePhase,
      nextPhase: null,
      subPhase: null,
      events: [event.id],
    };
  }

  // Then, update idList, eventRecords, and RSVeEventGroupIndexMap
  // If it's first event of a new group, added its eventId to idList
  var idList = isFirstEventOfNewGroup
    ? [...events.idList, event.id]
    : events.idList;
  var records = {
    ...events.eventRecords,
    [event.id]: { event: event.event, level: event.level },
  };
  // If it's first event of a new group, added its groupId to RSVeEventGroupIndexMap
  var indexMap = isFirstEventOfNewGroup
    ? {
        ...events.RSVeEventGroupIndexMap,
        [event.event.group]: events.idList.length,
      }
    : events.RSVeEventGroupIndexMap;
  if (oldProgressEventId !== null) {
    if (oldProgressEventId === idList[indexMap[event.event.group]]) {
      idList[indexMap[event.event.group]] = event.id;
    }
    delete records[oldProgressEventId];
  }

  return {
    ...events,
    idList: idList,
    eventRecords: records,
    RSVeEventGroups: {
      ...events.RSVeEventGroups,
      [event.event.group]: group,
    },
    RSVeEventGroupIndexMap: indexMap,
  };
}

function phaseToNumberList(phase: string): number[] {
  return phase.split('.').map((s) => parseInt(s));
}

function findOrCreateTheNode(
  node: RSVePhaseNode,
  phase: string
): RSVePhaseNode {
  var currentNode = node;
  const targetPhase = phaseToNumberList(phase);
  // phaseLevel indicates the comparison index between targetPhase and phaseToNumberList(currentNode.phase).
  var phaseLevel = 0;

  while (phaseLevel < targetPhase.length) {
    if (
      targetPhase[phaseLevel] ===
      phaseToNumberList(currentNode.phase)[phaseLevel]
    ) {
      if (phaseLevel === targetPhase.length - 1) {
        break;
      } else {
        if (currentNode.subPhase === null) {
          currentNode.subPhase = {
            phase: targetPhase.slice(0, phaseLevel + 2).join('.'),
            nextPhase: null,
            subPhase: null,
            events: null,
          };
        }
        currentNode = currentNode.subPhase;
        phaseLevel++;
      }
    } else {
      if (currentNode.nextPhase === null) {
        currentNode.nextPhase = {
          phase: targetPhase.slice(0, phaseLevel + 1).join('.'),
          nextPhase: null,
          subPhase: null,
          events: null,
        };
      }
      currentNode = currentNode.nextPhase;
    }
  }

  return currentNode;
}
