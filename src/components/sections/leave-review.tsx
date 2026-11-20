"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent } from "react";
import { gsap } from "@/lib/gsap";
import { submitReview } from "@/app/actions/public";

const MAX = 800;
const STAR = "M12 0Q13 10.5 24 12Q13 13.5 12 24Q11 13.5 0 12Q11 10.5 12 0Z";

/** One mood per rating (0 = nothing chosen). Colours climb from slate to FRX blue. */
const MOODS = [
  { label: "Tap a star", color: "#8a93a5" },
  { label: "That was rough", color: "#64708a" },
  { label: "Could be better", color: "#4a72b8" },
  { label: "Pretty good", color: "#2f6fd8" },
  { label: "Really great", color: "#045cec" },
  { label: "Brilliant!", color: "#008cff" },
] as const;
const MOUTH_Y = [128, 106, 117, 128, 150, 170];

/**
 * A face that reacts to the rating. The mouth is ONE path whose control point is
 * tweened (frown → flat → grin), the eyes squint when delighted, brows tilt,
 * cheeks appear and the disc takes the mood colour. Decorative (aria-hidden):
 * the rating itself is a real radio group.
 */
function MoodFace({ rating }: { rating: number }) {
  const mouth = useRef<SVGPathElement>(null);
  const val = useRef({ y: 128 });
  const { color } = MOODS[rating];
  const happy = rating >= 4;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(val.current, {
      y: MOUTH_Y[rating],
      duration: reduce ? 0 : 0.55,
      ease: "elastic.out(1, 0.6)",
      onUpdate: () => mouth.current?.setAttribute("d", `M 64 126 Q 100 ${val.current.y} 136 126`),
    });
  }, [rating]);

  const squint = rating === 5 ? 0.3 : rating === 1 ? 0.65 : 1;
  const browL = rating === 1 ? 14 : rating === 2 ? 6 : rating >= 4 ? -6 : 0;
  const t = "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)";

  return (
    <div className="fxr-face" aria-hidden="true">
      <div className="fxr-halo" style={{ background: color, opacity: rating ? 0.4 : 0.16 }} />
      <svg viewBox="0 0 200 200" className="fxr-ring">
        <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeOpacity=".2" strokeWidth="1.4" strokeDasharray="2 9" />
      </svg>
      <svg viewBox="0 0 200 200" className="fxr-disc" key={rating}>
        <defs>
          <radialGradient id="fxr-shade" cx="35%" cy="28%" r="80%">
            <stop offset="0" stopColor="#fff" stopOpacity=".45" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#031f6e" stopOpacity=".25" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="78" style={{ fill: color, transition: "fill 0.5s" }} stroke="var(--fx-ink)" strokeWidth="5" />
        <circle cx="100" cy="100" r="78" fill="url(#fxr-shade)" />
        <ellipse cx="58" cy="116" rx="11" ry="7" fill="#fff" style={{ opacity: happy ? 0.4 : 0, transition: "opacity .3s" }} />
        <ellipse cx="142" cy="116" rx="11" ry="7" fill="#fff" style={{ opacity: happy ? 0.4 : 0, transition: "opacity .3s" }} />
        <ellipse cx="72" cy="88" rx="8" ry="9" fill="#08090c" style={{ transform: `scaleY(${squint})`, transformOrigin: "72px 88px", transition: t }} />
        <ellipse cx="128" cy="88" rx="8" ry="9" fill="#08090c" style={{ transform: `scaleY(${squint})`, transformOrigin: "128px 88px", transition: t }} />
        <path d="M 58 70 L 86 70" stroke="#08090c" strokeWidth="5" strokeLinecap="round" style={{ transform: `rotate(${browL}deg) translateY(${happy ? -4 : 0}px)`, transformOrigin: "72px 70px", transition: t }} />
        <path d="M 114 70 L 142 70" stroke="#08090c" strokeWidth="5" strokeLinecap="round" style={{ transform: `rotate(${-browL}deg) translateY(${happy ? -4 : 0}px)`, transformOrigin: "128px 70px", transition: t }} />
        <path ref={mouth} d="M 64 126 Q 100 128 136 126" fill="none" stroke="#08090c" strokeWidth="7" strokeLinecap="round" />
      </svg>
    </div>
  );
}

type Particle = { id: number; dx: number; dy: number; r: number; s: number; c: string };
const COLORS = ["#045cec", "#008cff", "#08090c", "#6ab8ff", "#0433a8"];
const burst = (n: number, spread: number, seed: number): Particle[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + seed;
    const d = spread * (0.55 + ((i * 37) % 10) / 22);
    return { id: i, dx: Math.cos(a) * d, dy: Math.sin(a) * d - spread * 0.15, r: ((i * 53) % 360) - 180, s: 0.6 + ((i * 17) % 10) / 12, c: COLORS[i % COLORS.length] };
  });

function Sparkles({ items }: { items: Particle[] }) {
  return (
    <>
      {items.map((p) => (
        <svg
          key={p.id}
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="fxr-p"
          style={{ color: p.c, ["--dx" as string]: `${p.dx}px`, ["--dy" as string]: `${p.dy}px`, ["--r" as string]: `${p.r}deg`, ["--s" as string]: p.s }}
          fill="currentColor"
        >
          <path d={STAR} />
        </svg>
      ))}
    </>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="fxr-ro" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-on={i <= value}>
          <path d={STAR} />
        </svg>
      ))}
    </span>
  );
}

/**
 * "Leave a review". Expressive on purpose — the stars light as you hover and
 * burst when chosen while the face changes mood; a live preview tilts toward
 * the pointer as you type; sending ends in a burst of stars. Honest by design:
 * submissions are stored as PENDING and appear on the site only after approval
 * in the admin panel. Keyboard: the stars are a radio group (arrow keys).
 * Reduced-motion visitors get the same flow without the effects.
 */
export function LeaveReview({ enabled = true }: { enabled?: boolean }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [text, setText] = useState("");
  const [trap, setTrap] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const [burstAt, setBurstAt] = useState<{ star: number; n: number } | null>(null);
  const [confetti, setConfetti] = useState(0);
  const meta = useRef({ token: "", start: 0 });
  const reduce = useRef(false);

  useEffect(() => {
    meta.current = { token: crypto.randomUUID(), start: Date.now() };
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const shown = hover || rating;
  const mood = MOODS[shown];
  const sparks = useMemo(() => burst(12, 70, burstAt?.n ?? 0), [burstAt?.n]);
  const cloud = useMemo(() => burst(44, 320, confetti), [confetti]);

  const choose = (i: number) => {
    setRating(i);
    setErrors((e) => ({ ...e, rating: "" }));
    if (!reduce.current) setBurstAt({ star: i, n: Date.now() % 1000 });
  };
  const onStarKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      choose(Math.min(5, (rating || 0) + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      choose(Math.max(1, (rating || 2) - 1));
    }
  };

  const card = useRef<HTMLDivElement>(null);
  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    const el = card.current;
    if (!el || reduce.current || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg)`;
  };
  const untilt = () => {
    if (card.current) card.current.style.transform = "";
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    const er: Record<string, string> = {};
    if (rating < 1) er.rating = "Please choose a star rating.";
    if (name.trim().length < 2) er.name = "Please enter your name.";
    if (text.trim().length < 10) er.text = "Please write at least 10 characters.";
    setErrors(er);
    if (Object.keys(er).length) {
      document.getElementById(er.rating ? "fxr-stars" : er.name ? "fxr-name" : "fxr-text")?.focus();
      return;
    }
    setStatus("sending");
    setServerError("");
    try {
      const r = await submitReview({
        name,
        company,
        rating,
        text,
        trap,
        token: meta.current.token,
        elapsed: Date.now() - meta.current.start,
      });
      if (r.ok) {
        setStatus("done");
        if (!reduce.current) setConfetti((c) => c + 1.7);
      } else {
        setErrors(r.fieldErrors ?? {});
        setServerError(r.error);
        setStatus("error");
      }
    } catch {
      setServerError("We could not reach the server. Check your connection and try again.");
      setStatus("error");
    }
  };

  const again = () => {
    setStatus("idle");
    setRating(0);
    setHover(0);
    setName("");
    setCompany("");
    setText("");
    setErrors({});
    meta.current = { token: crypto.randomUUID(), start: Date.now() };
  };

  return (
    <section className="fxr" data-glow id="review" aria-labelledby="fxr-title">
      <div className="fx-container">
        <header className="fxr-head">
          <h2 id="fxr-title" className="fxr-h fx-d1 fx-up" data-fx="reveal-lines">
            Leave a review
          </h2>
          <p className="fx-lead fxr-lead" data-fx="fade-up">
            Worked with FRX Technologies? Tell us how it went. Reviews are published only after we
            have approved them.
          </p>
        </header>

        {!enabled ? (
          <p className="fxr-off">Reviews are not available right now. Please check back soon.</p>
        ) : (
          <div className="fxr-grid">
            <div className="fxr-stage">
              <MoodFace rating={shown} />
              <div className="fxr-rating">
                <div
                  className="fxr-stars"
                  role="radiogroup"
                  aria-label="Your rating"
                  aria-describedby={errors.rating ? "fxr-rating-err" : undefined}
                  onMouseLeave={() => setHover(0)}
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      id={i === 1 ? "fxr-stars" : undefined}
                      type="button"
                      role="radio"
                      aria-checked={rating === i}
                      aria-label={`${i} star${i > 1 ? "s" : ""}: ${MOODS[i].label}`}
                      tabIndex={rating === i || (!rating && i === 1) ? 0 : -1}
                      className="fxr-star"
                      data-on={i <= shown}
                      onMouseEnter={() => setHover(i)}
                      onFocus={() => setHover(i)}
                      onBlur={() => setHover(0)}
                      onClick={() => choose(i)}
                      onKeyDown={onStarKey}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-pop={rating === i}>
                        <path d={STAR} />
                      </svg>
                      {burstAt?.star === i && <Sparkles key={burstAt.n} items={sparks} />}
                    </button>
                  ))}
                </div>
                <p className="fxr-mood fx-h3" aria-live="polite" style={{ color: shown ? mood.color : undefined }} key={mood.label}>
                  {mood.label}
                </p>
                {errors.rating && (
                  <p id="fxr-rating-err" role="alert" className="fxr-err">
                    {errors.rating}
                  </p>
                )}
              </div>
            </div>

            <div className="fxr-panel">
              {status === "done" ? (
                <div className="fxr-done" role="status">
                  <Sparkles key={confetti} items={cloud} />
                  <svg viewBox="0 0 64 64" className="fxr-check" aria-hidden="true">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="var(--fx-blue)" strokeWidth="3" pathLength={1} />
                    <path d="M20 33 l9 9 l16 -19" fill="none" stroke="var(--fx-blue)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
                  </svg>
                  <h3 className="fx-d3 fx-up">Thank you{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}!</h3>
                  <p className="fx-body">
                    Your review has been received. We read every one, and it will appear on this site
                    once it has been approved.
                  </p>
                  <button type="button" onClick={again} className="fx-btn fx-btn--outline">
                    Write another review
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate aria-label="Leave a review" className="fxr-form">
                  <input
                    type="text"
                    name="fx_hp_check"
                    id="fx_hp_check_r"
                    tabIndex={-1}
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    data-form-type="other"
                    aria-hidden="true"
                    value={trap}
                    onChange={(e) => setTrap(e.target.value)}
                    className="fxr-trap"
                  />
                  <div className="fxr-two">
                    <div className="fxr-f">
                      <label htmlFor="fxr-name">Your name</label>
                      <input
                        id="fxr-name"
                        name="name"
                        autoComplete="name"
                        maxLength={80}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "fxr-name-err" : undefined}
                      />
                      {errors.name && (
                        <p id="fxr-name-err" role="alert" className="fxr-err">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div className="fxr-f">
                      <label htmlFor="fxr-company">
                        Company <span>(optional)</span>
                      </label>
                      <input
                        id="fxr-company"
                        name="company"
                        autoComplete="organization"
                        maxLength={80}
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="fxr-f">
                    <div className="fxr-labelrow">
                      <label htmlFor="fxr-text">Your review</label>
                      <span className="fxr-count fx-tabular" aria-live="off">
                        <svg viewBox="0 0 36 36" aria-hidden="true">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="var(--fx-line)" strokeWidth="4" />
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            stroke={text.length > MAX * 0.9 ? "#08090c" : "var(--fx-blue)"}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={88}
                            strokeDashoffset={88 - 88 * Math.min(1, text.length / MAX)}
                            style={{ transition: "stroke-dashoffset .25s" }}
                          />
                        </svg>
                        {text.length}/{MAX}
                      </span>
                    </div>
                    <textarea
                      id="fxr-text"
                      name="text"
                      rows={5}
                      maxLength={MAX}
                      placeholder="Tell others what it was like to work with FRX Technologies…"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      aria-invalid={!!errors.text}
                      aria-describedby={errors.text ? "fxr-text-err" : undefined}
                    />
                    {errors.text && (
                      <p id="fxr-text-err" role="alert" className="fxr-err">
                        {errors.text}
                      </p>
                    )}
                  </div>

                  <div className="fxr-preview">
                    <p className="fx-label">Live preview</p>
                    <div ref={card} onPointerMove={tilt} onPointerLeave={untilt} className="fxr-pcard">
                      <Stars value={rating} />
                      <p className="fxr-ptext">
                        {text.trim() ? `“${text.trim()}”` : <span>Your words will appear here as you type.</span>}
                      </p>
                      <p className="fxr-pname">
                        {name.trim() || <span>Your name</span>}
                        {company.trim() && <span>, {company.trim()}</span>}
                      </p>
                    </div>
                  </div>

                  {status === "error" && (
                    <p role="alert" className="fxr-fail">
                      {serverError}
                    </p>
                  )}

                  <div className="fxr-actions">
                    <p className="fx-small fx-muted">Your review appears publicly only after approval.</p>
                    <button type="submit" disabled={status === "sending"} className="fx-btn">
                      {status === "sending" ? "Sending…" : "Send my review"}
                      <span className="fx-shift" aria-hidden="true">→</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
