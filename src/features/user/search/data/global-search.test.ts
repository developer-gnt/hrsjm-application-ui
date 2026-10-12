import { searchApplicationContent } from './global-search';

describe('searchApplicationContent', () => {
  it('returns no results for a blank query', () => {
    expect(searchApplicationContent('   ')).toEqual([]);
  });

  it('finds events and retains their real event IDs', () => {
    const results = searchApplicationContent('legal awareness workshop');
    const eventResult = results.find(result => result.kind === 'event');

    expect(eventResult?.kind).toBe('event');
    if (eventResult?.kind === 'event') {
      expect(eventResult.event.id).toBe('legal-awareness-workshop');
    }
  });

  it('finds rights and work areas', () => {
    expect(searchApplicationContent('education').some(
      result => result.kind === 'right' && result.rightId === 'right-to-education',
    )).toBe(true);
    expect(searchApplicationContent('leadership').some(
      result =>
        result.kind === 'work-area' &&
        result.contentId === 'leadership-development',
    )).toBe(true);
  });

  it('finds news articles by their available text', () => {
    expect(searchApplicationContent('legal awareness initiative').some(
      result =>
        result.kind === 'news' &&
        result.article.id === 'legal-awareness-initiative',
    )).toBe(true);
  });
});
