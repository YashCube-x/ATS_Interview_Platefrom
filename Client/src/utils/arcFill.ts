/**
 * Arc-fill interaction script according to Purchase Portal DesignMD
 * Computes background luminance, tracks pointer entry coordinates (--mx, --my),
 * and handles light buttons (navy arc fill) vs solid buttons (white hollow-out).
 */

function parseRgb(color: string): [number, number, number] | null {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
}

function getLuminance(r: number, g: number, b: number): number {
  return 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
}

export function installArcFill(): () => void {
  const handlePointer = (e: MouseEvent | TouchEvent) => {
    const target = (e.target as HTMLElement)?.closest('button, .liquid');
    if (!target || !(target instanceof HTMLElement)) return;

    // Skipped elements per DesignMD
    if (
      target.hasAttribute('disabled') ||
      target.getAttribute('aria-disabled') === 'true' ||
      target.hasAttribute('data-no-liquid') ||
      ['switch', 'tab', 'option', 'menuitem', 'checkbox'].includes(target.getAttribute('role') || '') ||
      target.classList.contains('text-left')
    ) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX ?? rect.left : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY ?? rect.top : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    target.style.setProperty('--mx', `${x}px`);
    target.style.setProperty('--my', `${y}px`);

    // Determine background type if not set yet
    if (!target.dataset.af) {
      const computed = window.getComputedStyle(target);
      const bg = computed.backgroundColor;
      const rgb = parseRgb(bg);

      if (rgb && bg !== 'transparent' && !bg.includes('rgba(0, 0, 0, 0)')) {
        const lum = getLuminance(rgb[0], rgb[1], rgb[2]);
        if (lum < 0.25) {
          target.dataset.af = 'dark';
          target.style.setProperty('--af-bg', bg);
        } else if (lum < 0.65) {
          target.dataset.af = 'mid';
          target.style.setProperty('--af-bg', bg);
        } else {
          target.dataset.af = 'light';
        }
      } else {
        target.dataset.af = 'light';
      }
    }
  };

  document.addEventListener('pointerenter', handlePointer as EventListener, true);
  document.addEventListener('touchstart', handlePointer as EventListener, { passive: true, capture: true });

  return () => {
    document.removeEventListener('pointerenter', handlePointer as EventListener, true);
    document.removeEventListener('touchstart', handlePointer as EventListener, true);
  };
}
