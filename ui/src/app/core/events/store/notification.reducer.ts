import { cloneDeep, create } from 'lodash';

import { createReducer, on } from '@ngrx/store';
import { SSEActions } from './notification.actions';


/**
 * Data format of events receive from SSE.
 */
type RSVeEvent = {
  info: string;
  type: string;
  // Phases like: 0, 1, 2, 3, 3.1, 3.2, 3.2.1, etc.
  RSVePhase: string;
  // Id of the group this event belongs to.
  group: string;
}

export const errorLevel = '40';

export type EventType = {
  event: string | RSVeEvent;
  level: string;
  id: string;
}


/**
 * Data structure of RSV executor events store.
 */
type RSVePhaseNode = {
  phase: string;
  // nexPhase means 0 -> 1 or 1.1 -> 1.2, it's not always obeying the sequence.
  nextPhase: RSVePhaseNode | null;
  // First sub phase: 0.1 or 0.2, 0.3, etc under phase 0
  subPhase: RSVePhaseNode | null;
  // Id list of events tagged for this phase,
  // It also sorts the events in order of time (earliest to latest)
  events: string[] | null;
}


/**
 * NgRx store data structure.
 */
export type EventRecord = {
  event: string | RSVeEvent;
  level: string;
}

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
    RSVeEventGroupIndexMap: Record<number, string>;
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
      const isFirstEventOfNewGroup: boolean = !state.events.RSVeEventGroups.hasOwnProperty(event.event.group)
      return {
        ...state,
        events: {
          ...state.events,
          // If it's first event of a new group, added its eventId to idList
          idList: isFirstEventOfNewGroup ? 
            [...state.events.idList, event.id] : state.events.idList,
          eventRecords: {
            ...state.events.eventRecords,
            [event.id]: {
              event: event.event,
              level: event.level,
            },
          },
          RSVeEventGroups: addNewRSVeEvent(state.events.RSVeEventGroups, event),
          // If it's first event of a new group, added its groupId to RSVeEventGroupIndexMap
          RSVeEventGroupIndexMap: isFirstEventOfNewGroup ?
            {
              ...state.events.RSVeEventGroupIndexMap,
              [state.events.idList.length]: event.event.group
            } : state.events.RSVeEventGroupIndexMap
        },
      }
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
        }
      }
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
          level: errorLevel,
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

function phaseToNumberList(phase: string): number[] {
  return phase.split('.').map((s) => parseInt(s));
}

function findOrCreateTheNode(node: RSVePhaseNode, phase: string): RSVePhaseNode {
  var currentNode = node
  const targetPhase = phaseToNumberList(phase)
  // phaseLevel indicates the comparison index between targetPhase and phaseToNumberList(currentNode.phase).
  var phaseLevel = 0

  while (phaseLevel < targetPhase.length) {
    if (targetPhase[phaseLevel] === phaseToNumberList(currentNode.phase)[phaseLevel]) {
      if (phaseLevel === targetPhase.length - 1) {
        break;
      } else {
        if (currentNode.subPhase === null) {
          currentNode.subPhase = {
            phase: targetPhase.slice(0, phaseLevel + 2).join('.'),
            nextPhase: null,
            subPhase: null,
            events: null
          }
        }
        currentNode = currentNode.subPhase
        phaseLevel++
      }
    } else {
      if (currentNode.nextPhase === null) {
        currentNode.nextPhase = {
          phase: targetPhase.slice(0, phaseLevel + 1).join('.'),
          nextPhase: null,
          subPhase: null,
          events: null
        }
      }
      currentNode = currentNode.nextPhase
    }
  }

  return currentNode
}

/**
 * Add a new RSVe event to RSVeEventGroups.
 * @param eventGroups current RSVeEventGroups state
 * @param event new RSVe event from SSE
 */
function addNewRSVeEvent(
  eventGroups: Record<string, RSVePhaseNode>,
  event: EventType,
): Record<number, RSVePhaseNode> {
  if (isRSVeEvent(event.event)) {
    var group: RSVePhaseNode   
    if (eventGroups.hasOwnProperty(event.event.group)) {
      // If the group already exists, find the right node to add the event.
      var group = cloneDeep(eventGroups[event.event.group]);
      var node = findOrCreateTheNode(group, event.event.RSVePhase);
      node.events === null ? [event.id] : [...node.events, event.id];
    } else {
      // Create a new group if the group does not exist.
      group = {
        phase: event.event.RSVePhase,
        nextPhase: null,
        subPhase: null,
        events: [event.id]
      }
    }
    return {
      ...eventGroups,
      [event.event.group]: group
    }
  }
  return eventGroups
}