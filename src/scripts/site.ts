// The site's few behaviours: things appear as they're scrolled to, screenshots open full size, the hero's windows
// tilt a little with the pointer, tabs (which can advance by themselves), and the guide's contents follow the reading.
// Everything works without it; nothing moves when Reduce Motion is on.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.documentElement.classList.add('js');

// Appearing on scroll
function reveal() {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal], .stage');
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('in'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      }
    },
    // Any part of it on screen (a share of a tall element might never fit in the window)
    { rootMargin: '0px 0px -8% 0px', threshold: 0 },
  );
  items.forEach((item) => observer.observe(item));
}

// Screenshots full size, in a dialog (Escape, the close button or a click outside closes it)
function lightbox() {
  const dialog = document.querySelector<HTMLDialogElement>('dialog.lightbox');
  if (!dialog) return;
  const image = dialog.querySelector<HTMLImageElement>('img')!;
  const caption = dialog.querySelector<HTMLElement>('figcaption')!;
  const dark = window.matchMedia('(prefers-color-scheme: dark)');
  let opener: HTMLElement | null = null;
  document.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLElement>('[data-zoom]');
    if (!button) return;
    opener = button;
    image.src = (dark.matches ? button.dataset.dark : button.dataset.light) ?? '';
    image.alt = button.dataset.alt ?? '';
    image.style.aspectRatio = button.dataset.ratio ?? '';
    caption.textContent = button.dataset.alt ?? '';
    dialog.showModal();
  });
  dialog.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target === dialog || target.closest('[data-close]')) dialog.close();
  });
  dialog.addEventListener('close', () => {
    image.removeAttribute('src');
    opener?.focus();
  });
}

// The hero's windows lean towards the pointer
function tilt() {
  const stage = document.querySelector<HTMLElement>('[data-tilt]');
  if (!stage || reduceMotion.matches || !window.matchMedia('(pointer: fine)').matches) return;
  let frame = 0;
  stage.addEventListener('pointermove', (event) => {
    const box = stage.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      stage.style.setProperty('--tilt-x', `${(-y * 5).toFixed(2)}deg`);
      stage.style.setProperty('--tilt-y', `${(x * 7).toFixed(2)}deg`);
    });
  });
  stage.addEventListener('pointerleave', () => {
    stage.style.setProperty('--tilt-x', '0deg');
    stage.style.setProperty('--tilt-y', '0deg');
  });
}

// Tabs: click, arrow keys, Home and End; with data-autoplay, the next one after its bar fills (paused while the
// pointer or the keyboard is in them, and never with Reduce Motion)
function tabs() {
  document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((root) => {
    const list = root.querySelector<HTMLElement>('[role="tablist"]')!;
    const buttons = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const panels = buttons.map((button) => document.getElementById(button.getAttribute('aria-controls')!)!);
    const autoplay = root.hasAttribute('data-autoplay') && !reduceMotion.matches;
    let current = Math.max(0, buttons.findIndex((button) => button.getAttribute('aria-selected') === 'true'));

    function select(index: number, focus = false) {
      current = (index + buttons.length) % buttons.length;
      buttons.forEach((button, i) => {
        const selected = i === current;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
        panels[i].hidden = !selected;
      });
      if (focus) buttons[current].focus();
      if (autoplay) {
        // Restart the bar's animation
        const bar = buttons[current].querySelector<HTMLElement>('.tab-progress');
        if (bar) {
          bar.style.animation = 'none';
          void bar.offsetWidth;
          bar.style.animation = '';
        }
      }
    }

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => select(index));
      button.querySelector('.tab-progress')?.addEventListener('animationend', () => {
        if (autoplay && index === current) select(current + 1);
      });
    });
    list.addEventListener('keydown', (event) => {
      const vertical = list.getAttribute('aria-orientation') === 'vertical';
      const next = vertical ? 'ArrowDown' : 'ArrowRight';
      const previous = vertical ? 'ArrowUp' : 'ArrowLeft';
      if (event.key === next) select(current + 1, true);
      else if (event.key === previous) select(current - 1, true);
      else if (event.key === 'Home') select(0, true);
      else if (event.key === 'End') select(buttons.length - 1, true);
      else return;
      event.preventDefault();
    });
    if (autoplay) {
      root.classList.add('autoplay');
      const pause = () => root.classList.add('paused');
      const resume = () => {
        if (!root.matches(':hover') && !root.contains(document.activeElement)) root.classList.remove('paused');
      };
      root.addEventListener('pointerenter', pause);
      root.addEventListener('pointerleave', resume);
      root.addEventListener('focusin', pause);
      root.addEventListener('focusout', () => setTimeout(resume, 0));
      // Only while it's on screen
      new IntersectionObserver(([entry]) => root.classList.toggle('offscreen', !entry.isIntersecting)).observe(root);
    }
    select(current);
  });
}

// The guide's contents: the section being read is marked
function contents() {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.toc a[href^="#"]'));
  if (!links.length || !('IntersectionObserver' in window)) return;
  const sections = links.map((link) => document.getElementById(link.hash.slice(1))).filter(Boolean) as HTMLElement[];
  const visible = new Set<string>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      }
      const first = sections.find((section) => visible.has(section.id));
      if (!first) return;
      links.forEach((link) => link.classList.toggle('active', link.hash === `#${first.id}`));
    },
    { rootMargin: '-15% 0px -70% 0px' },
  );
  sections.forEach((section) => observer.observe(section));
}

reveal();
lightbox();
tilt();
tabs();
contents();
