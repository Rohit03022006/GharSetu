import React from 'react';

export const BorderBeam = ({
  className = '',
  size = 200,
  duration = 12,
  borderWidth = 1.5,
  colorFrom = '#3FC2BD',
  colorTo = '#6366f1',
  delay = 0,
}) => {
  return (
    <div
      style={{
        '--size': `${size}px`,
        '--duration': `${duration}s`,
        '--border-width': `${borderWidth}px`,
        '--color-from': colorFrom,
        '--color-to': colorTo,
        '--delay': `-${delay}s`,
      }}
      className={`pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)] [mask-composite:exclude] z-20 ${className}`}
    >
      <div
        className="absolute aspect-square w-[var(--size)] animate-[border-beam_var(--duration)_infinite_linear] bg-gradient-to-l from-[var(--color-from)] via-[var(--color-to)] to-transparent [animation-delay:var(--delay)] [offset-anchor:100%_50%] [offset-path:rect(0_100%_100%_0_round_var(--size))]"
      />
    </div>
  );
};
