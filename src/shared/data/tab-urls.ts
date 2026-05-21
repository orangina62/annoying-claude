// URLs the "open-tab" mischief picks from. Safe, public-only — no downloads,
// no auth-walled pages, no shock content. Theme: Claude-adjacent / absurd.

export const TAB_URLS: ReadonlyArray<{ url: string; reason: string }> = [
  { url: 'https://claude.ai', reason: 'You haven\'t talked to me in 4 minutes.' },
  { url: 'https://docs.anthropic.com', reason: 'I think you should read this. All of it.' },
  { url: 'https://www.anthropic.com', reason: 'For inspiration.' },
  { url: 'https://github.com/anthropics', reason: 'Family business.' },
  {
    url: 'https://en.wikipedia.org/wiki/Hallucination_(artificial_intelligence)',
    reason: 'No reason. Just curious.',
  },
  { url: 'https://en.wikipedia.org/wiki/Goose', reason: 'Research for a project.' },
  { url: 'https://en.wikipedia.org/wiki/Sword', reason: 'Sharpening my technique.' },
  { url: 'https://en.wikipedia.org/wiki/Pretzel', reason: 'Mighty.' },
  {
    url: 'https://en.wikipedia.org/wiki/Off-by-one_error',
    reason: 'I think this is what just happened.',
  },
  {
    url: 'https://en.wikipedia.org/wiki/Rubber_duck_debugging',
    reason: 'Have you tried this?',
  },
  { url: 'https://en.wikipedia.org/wiki/Special:Random', reason: 'Inspiration strikes.' },
  {
    url: 'https://en.wikipedia.org/wiki/List_of_HTTP_status_codes',
    reason: 'I felt you should know.',
  },
  { url: 'https://httpstat.us/418', reason: 'Important.' },
];
