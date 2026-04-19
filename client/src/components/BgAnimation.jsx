import { useEffect, useRef } from 'react';

const DEPTHS = [0.035, 0.055, 0.07, 0.045, 0.025];

export default function BgAnimation() {
  const orbRefs = useRef([]);
  const target  = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafId   = useRef(null);

  useEffect(() => {
    function onMove(e) {
      const cx = (e.clientX / window.innerWidth  - 0.5) * 2;
      const cy = (e.clientY / window.innerHeight - 0.5) * 2;
      target.current = { x: cx, y: cy };
    }

    function tick() {
      const lerp = 0.06;
      current.current.x += (target.current.x - current.current.x) * lerp;
      current.current.y += (target.current.y - current.current.y) * lerp;

      orbRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = DEPTHS[i];
        const tx = current.current.x * window.innerWidth  * d;
        const ty = current.current.y * window.innerHeight * d;
        el.style.transform = `translate(${tx}px, ${ty}px)`;
      });

      rafId.current = requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div className="bg-anim" aria-hidden="true">
      {[1,2,3,4,5].map((n, i) => (
        <div
          key={n}
          className={`bg-orb bg-orb-${n}`}
          ref={el => orbRefs.current[i] = el}
        />
      ))}
      <div className="bg-breathe" />
    </div>
  );
}
