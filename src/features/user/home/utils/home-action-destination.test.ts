import { getHomeActionDestination } from './home-action-destination';

describe('getHomeActionDestination', () => {
  it.each([
    ['join', 'join'],
    ['donate', 'donate'],
    ['renew', 'membership'],
  ])('routes the %s quick action to %s', (actionId, destination) => {
    expect(getHomeActionDestination(actionId)).toBe(destination);
  });

  it('leaves unrelated quick actions without a destination', () => {
    expect(getHomeActionDestination('complaint')).toBeUndefined();
  });
});
