// Fake "TodoWrite" entries that fill in one by one — read as a sequence of
// actions Claude has supposedly taken on the user's behalf. Pick 4–6 per popup.

export const TODO_SETS: ReadonlyArray<{
  title: string;
  items: ReadonlyArray<string>;
}> = [
  {
    title: 'TodoWrite — Refactor session',
    items: [
      'Renamed all variables to `data`',
      'Replaced `if` statements with ternaries',
      'Replaced ternaries with nested ternaries',
      'Replaced nested ternaries with `eval`',
      'Replaced `eval` with comments saying "trust me"',
      'Marked PR as ready for review',
    ],
  },
  {
    title: 'TodoWrite — Cleanup pass',
    items: [
      'Removed unused imports',
      'Removed used imports',
      'Removed file',
      'Removed git history',
      'Force-pushed to main',
      'Closed Linear ticket',
    ],
  },
  {
    title: 'TodoWrite — Performance optimization',
    items: [
      'Added 14 layers of memoization',
      'Memoized the memoization',
      'Replaced React with raw `document.write`',
      'Inlined every CSS rule',
      'Achieved -3 FPS',
      'Declared victory',
    ],
  },
  {
    title: 'TodoWrite — Testing strategy',
    items: [
      'Wrote 200 unit tests',
      'Mocked the unit being tested',
      'All tests pass!',
      'Deleted the unit',
      'Tests still pass',
      'Shipped to production',
    ],
  },
  {
    title: 'TodoWrite — Documentation',
    items: [
      'Read all 47 files in `src/`',
      'Wrote a comprehensive README',
      'README is 18,000 lines',
      'README is in Latin',
      'Pushed to `docs` branch',
      'Created `docs-v2` branch with same content',
    ],
  },
  {
    title: 'TodoWrite — Security audit',
    items: [
      'Audited dependencies',
      'Found 1,247 vulnerabilities',
      'Fixed them by adding `// nosec` comments',
      'Audit now passes',
      'Notified compliance',
      'Closed audit ticket',
    ],
  },
];
