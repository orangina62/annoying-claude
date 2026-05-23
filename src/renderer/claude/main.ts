import { Character } from './character';
import { play } from './audio';
import { DialogueBox } from './dialogue';
import { EffectLayer } from './effects';
import { Opponent } from './opponent';

async function boot(): Promise<void> {
  const canvas = document.getElementById('stage') as HTMLCanvasElement;
  const g = canvas.getContext('2d');
  if (!g) throw new Error('No 2D context');
  g.imageSmoothingEnabled = false;

  const boot = await window.claudeAPI.getBootInfo();
  resizeCanvas(canvas, boot.screen);

  const dialogue = new DialogueBox();
  const effects = new EffectLayer();
  let opponent: Opponent | null = null;

  const character = new Character({
    screen: boot.screen,
    onArrived: () => window.claudeAPI.notifyArrived(),
    getOpponent: () => opponent,
    onBattleSwing: (dir, targetIsOpponent) => {
      play('beep');
      const forcePx = 90 + Math.random() * 50;
      if (targetIsOpponent && opponent) {
        // In-canvas knockback on the goose, not the OS cursor.
        opponent.applyHit(dir, forcePx);
      } else {
        window.claudeAPI.notifyBattleSwingHit({ dirX: dir.x, dirY: dir.y, forcePx });
      }
    },
    onBattleEnd: () => {
      play('pop');
      // Duel timer is up — send any surviving goose fleeing off-screen.
      opponent?.retreat();
    },
    onHit: () => play('pop'),
    onStunned: () => play('thinking'),
  });

  window.claudeAPI.onCharacterCommand((cmd) => {
    if (cmd.type === 'click-ripple') {
      if (cmd.x != null && cmd.y != null) {
        effects.addRipple(cmd.x, cmd.y);
        play('beep');
      }
      return;
    }
    character.handleCommand(cmd);
  });
  window.claudeAPI.onPlaySound((sound) => play(sound));
  window.claudeAPI.onBattleStart(({ durationMs }) => {
    play('ding');
    dialogue.cancel(); // battles override any in-progress speech
    character.enterBattle(durationMs);
  });
  window.claudeAPI.onDialogueShow((payload) => {
    if (character.isBattling()) return; // battles drown out speech
    dialogue.show(payload);
  });
  window.claudeAPI.onDuelStart(({ entryEdge, durationMs }) => {
    play('honk');
    dialogue.cancel();
    opponent = new Opponent(
      {
        screen: { width: window.innerWidth, height: window.innerHeight },
        onHonk: () => play('honk'),
        onContactClaude: () => character.takeOpponentHit(),
        onDefeated: () => play('pop'),
        onGone: () => {
          // Intentionally no-op: nulling `opponent` here runs synchronously
          // from inside `opponent.update(...)`, and the very next line below
          // (`opponent.draw(g)`) then throws on null and kills the render
          // loop — Claude vanishes for good. Let the next-frame `isAlive()`
          // branch null it safely between frames instead.
        },
      },
      entryEdge,
    );
    character.enterBattle(durationMs);
  });

  // Hit-test: enable real mouse capture only when the cursor is over the
  // mascot's bounding box. The window is otherwise click-through.
  let clickThrough = true;
  const updateClickThrough = (clientX: number, clientY: number): void => {
    const b = character.getBoundingBox();
    const inside =
      clientX >= b.x && clientX < b.x + b.w && clientY >= b.y && clientY < b.y + b.h;
    if (inside && clickThrough) {
      clickThrough = false;
      window.claudeAPI.setClickThrough(false);
    } else if (!inside && !clickThrough) {
      clickThrough = true;
      window.claudeAPI.setClickThrough(true);
    }
  };

  window.addEventListener('mousemove', (e) => {
    updateClickThrough(e.clientX, e.clientY);
    if (character.isBattling()) character.updateCursor(e.clientX, e.clientY);
  });

  window.addEventListener('mousedown', (e) => {
    const b = character.getBoundingBox();
    const inside =
      e.clientX >= b.x && e.clientX < b.x + b.w && e.clientY >= b.y && e.clientY < b.y + b.h;
    if (inside) {
      window.claudeAPI.notifyClicked();
    }
  });

  let last = performance.now();
  const loop = (now: number): void => {
    const dt = now - last;
    last = now;

    g.clearRect(0, 0, canvas.width, canvas.height);
    character.update(dt);
    if (opponent && opponent.isAlive()) {
      const claudeBb = character.getBoundingBox();
      opponent.update(dt, {
        x: claudeBb.x + claudeBb.w / 2,
        y: claudeBb.y + claudeBb.h / 2,
      });
      // Belt-and-suspenders: even though we no longer null `opponent` from
      // inside onGone, guard against any callback that might do so in the
      // future — calling .draw on null kills the whole render loop.
      if (opponent) {
        opponent.draw(g);
        if (opponent.isDefeated()) character.endBattle();
      }
    } else if (opponent && !opponent.isAlive()) {
      opponent = null;
    }
    character.draw(g);
    effects.update(dt);
    effects.draw(g);
    dialogue.update(dt);
    const anchor = character.getDialogueAnchor();
    dialogue.draw(g, {
      ...anchor,
      canvasW: window.innerWidth,
      canvasH: window.innerHeight,
    });

    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  window.addEventListener('resize', () => {
    resizeCanvas(canvas, { width: window.innerWidth, height: window.innerHeight });
    character.updateScreen({ width: window.innerWidth, height: window.innerHeight });
  });

  window.claudeAPI.notifyReady();
}

function resizeCanvas(canvas: HTMLCanvasElement, size: { width: number; height: number }): void {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = size.width * dpr;
  canvas.height = size.height * dpr;
  canvas.style.width = `${size.width}px`;
  canvas.style.height = `${size.height}px`;
  // Changing canvas.width resets all 2D state to defaults — re-apply ours.
  const g = canvas.getContext('2d');
  if (g) {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.imageSmoothingEnabled = false;
  }
}

void boot();
