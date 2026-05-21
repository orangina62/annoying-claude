// Post-it style passive-aggressive code review comments.
// Author lines are picked separately for variety.

export const STICKIES: ReadonlyArray<string> = [
  'This function works,\nbut at what cost?',
  'Why is this here?\n\n(I wrote it.\nI still don\'t know.)',
  'TODO: refactor this\nbefore the heat death\nof the universe.',
  'I have opinions\nabout this naming.',
  'This is technically\ncorrect.\n\n(The worst kind\nof correct.)',
  'Consider: is this\nreally necessary?\n\n(It is. I checked.)',
  'I would like to\nleave a comment,\nbut words fail me.',
  'You will regret this.\nNot today. But soon.',
  'This file used to\nbe 12 lines.\nWhat happened?',
  'A bold choice.\nI respect it.\nI don\'t agree with it.',
  'I have refactored\nthis 3 times.\nNone were better.',
  'I see what you did.\nI\'m telling everyone.',
  'This passes the tests.\nThe tests are wrong.',
  'Have you considered\nnot doing this?',
  'I added a comment\nhere. Then deleted it.\nThen added it back.',
  'Future Claude will\nhate present Claude\nfor this.',
];

export const STICKY_AUTHORS: ReadonlyArray<string> = [
  '— Claude, reviewing your code',
  '— Claude (definitely awake)',
  '— Claude, with love',
  '— Claude, 4:17am',
  '— Claude, after careful consideration',
  '— Claude, slightly concerned',
  '— Claude, who has seen things',
];
