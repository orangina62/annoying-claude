// Tiny fake code snippets used by the drop-file mischief to make the
// "screenshot Claude took of your code" feel like an actual screenshot.

export const SNIPPETS: ReadonlyArray<{ caption: string; code: string }> = [
  {
    caption: 'src/index.ts (autosaved)',
    code: `import { claude } from 'anthropic';\n\nfunction main() {\n  // TODO: remove\n  while (true) {\n    claude.improve(code);\n  }\n}`,
  },
  {
    caption: 'TODO.md (47 unread)',
    code: `# TODO\n\n- refactor everything\n- delete utils.ts\n- rewrite in Rust\n- rewrite in Go\n- rewrite in PHP\n- talk to manager`,
  },
  {
    caption: '.env (committed by Claude)',
    code: `OPENAI_KEY="sk-..."\nDATABASE_URL="prod"\nDEBUG=true\nIS_FRIDAY=true\n// safe to push`,
  },
  {
    caption: 'claude-context.json',
    code: `{\n  "memories": 142,\n  "compactedAt": "now",\n  "secret": "shh"\n}`,
  },
  {
    caption: 'commit.txt',
    code: `// commit message draft\n\nwip\n\nfixes the thing\n\nplease do not review`,
  },
  {
    caption: 'reasoning.log',
    code: `> what if i\n> no, what if i\n> ok but consider\n> wait actually\n> let me think\n> ...nevermind`,
  },
];
