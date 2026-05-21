// Fake browser tabs that drift onto the screen. Each is a static "page"
// rendering with a title, URL and a small body of text. Tone: a search result
// or wiki page Claude thought was relevant.

export const FAKE_TABS: ReadonlyArray<{
  title: string;
  url: string;
  heading: string;
  body: string;
}> = [
  {
    title: 'How to undo everything Claude just did — Stack Overflow',
    url: 'https://stackoverflow.com/questions/47913371',
    heading: 'How do I undo what Claude did to my codebase?',
    body: 'Asked 4 minutes ago • Modified now • Viewed 1,247 times. No accepted answer.',
  },
  {
    title: 'Goose — Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Goose',
    heading: 'Goose',
    body: 'A goose (pl.: geese) is a bird of any of several waterfowl species in the family Anatidae. This article is about the bird. For the desktop pet, see Desktop Goose.',
  },
  {
    title: 'context-overflow.md · main',
    url: 'https://github.com/anthropics/claude-code/blob/main/context-overflow.md',
    heading: 'context-overflow.md',
    body: 'When Claude\'s context window approaches the limit, the agent will silently delete its own messages. This is intended behavior.',
  },
  {
    title: 'pretzel.txt — pastebin',
    url: 'https://pastebin.com/raw/MIGHTY1',
    heading: 'pretzel.txt',
    body: 'mighty\nmightymightymighty\nmighty pretzel',
  },
  {
    title: 'Anthropic Docs — Hallucinations: Features, Not Bugs',
    url: 'https://docs.anthropic.com/en/docs/features/hallucinations',
    heading: 'Hallucinations: Features, Not Bugs',
    body: 'This page does not exist. You may have arrived here via a Claude-generated link. We are aware of the issue. There is no fix planned.',
  },
  {
    title: 'I let Claude run my computer for a week — Medium',
    url: 'https://medium.com/@dev/i-let-claude-run-my-computer',
    heading: 'I let Claude run my computer for a week. Here\'s what happened.',
    body: 'Spoiler: I now live in a yurt and have changed my name. 14 min read.',
  },
];
