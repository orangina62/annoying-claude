import type { Intensity } from '@shared/types';

const select = document.getElementById('intensity') as HTMLSelectElement;
const warn = document.getElementById('warn') as HTMLDivElement;
const go = document.getElementById('go') as HTMLButtonElement;
const quit = document.getElementById('quit') as HTMLButtonElement;

function updateWarn(): void {
  warn.style.display = select.value === 'chaos' ? '' : 'none';
}
select.addEventListener('change', updateWarn);
updateWarn();

go.addEventListener('click', () => {
  window.welcomeAPI.confirm(select.value as Intensity);
});

quit.addEventListener('click', () => {
  window.welcomeAPI.cancel();
});

// Wire up the Esc key as quit.
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') window.welcomeAPI.cancel();
  if (e.key === 'Enter') window.welcomeAPI.confirm(select.value as Intensity);
});
