import { getUpcomingMemberEvents } from './member-dashboard';
import { USER_EVENTS } from '../../events/data/user-events';

describe('getUpcomingMemberEvents', () => {
  it('returns existing events on or after today in date order', () => {
    expect(
      getUpcomingMemberEvents(USER_EVENTS, new Date(2026, 9, 25)).map(event => event.id),
    ).toEqual([
      'legal-awareness-workshop',
      'womens-rights-program',
      'community-outreach-drive',
      'education-awareness-session',
    ]);
  });

  it('excludes past events', () => {
    expect(
      getUpcomingMemberEvents(USER_EVENTS, new Date(2027, 0, 1)),
    ).toEqual([]);
  });

  it('ignores records with invalid dates', () => {
    expect(
      getUpcomingMemberEvents(
        [{ ...USER_EVENTS[0], date: 'not a date' }],
        new Date(2026, 0, 1),
      ),
    ).toEqual([]);
  });
});
