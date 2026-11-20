/**
 * SVG filters behind `.fx-outline`. Mount <FxDefs /> ONCE per page (inside the
 * root layout at adoption). Server-safe — no hooks, no client JS.
 *
 * The ring is `dilate(SourceGraphic) OUT SourceAlpha`. Dilating the graphic
 * (not just its alpha) carries the element's text colour into the ring, so the
 * outline colour is simply the CSS `color`. Radius is in px, hence three sizes.
 */
const SIZES = [
  ["sm", 1.2],
  ["md", 2.2],
  ["lg", 3.6],
] as const;

export function FxDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      {SIZES.map(([id, r]) => (
        <filter
          key={id}
          id={`fx-outline-${id}`}
          x="-4%"
          y="-10%"
          width="108%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          <feMorphology in="SourceGraphic" operator="dilate" radius={r} result="grown" />
          <feComposite in="grown" in2="SourceAlpha" operator="out" />
        </filter>
      ))}
    </svg>
  );
}
