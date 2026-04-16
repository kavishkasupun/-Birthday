import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

const TOTAL_STARS = 80;
const TOTAL_PETALS = 18;

// ─── Colombo timezone birthday target ───────────────────────────
const BIRTHDAY_UTC = new Date("2026-04-17T00:00:00+05:30");

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

// ─────────────────────────────────────────────
// 3D Love Loading Screen
// ─────────────────────────────────────────────
function LoveLoader({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0); // 0=loading, 1=fadeout
  const texts = [
    "Gathering your memories…",
    "Wrapping love with care…",
    "Almost there, sweetheart…",
    "Ready to celebrate! 🎂",
  ];

  useEffect(() => {
    let val = 0;
    const inc = setInterval(() => {
      val += randomBetween(0.8, 2.2);
      if (val >= 100) {
        val = 100;
        clearInterval(inc);
        setTimeout(() => {
          setPhase(1);
          setTimeout(onDone, 900);
        }, 600);
      }
      setProgress(Math.min(val, 100));
    }, 40);
    return () => clearInterval(inc);
  }, [onDone]);

  const textIdx = Math.min(Math.floor(progress / 26), 3);

  return (
    <div className={`love-loader ${phase === 1 ? "loader-fadeout" : ""}`}>
      {Array.from({ length: 18 }, (_, i) => (
        <span
          key={i}
          className="loader-heart"
          style={{
            left: `${randomBetween(2, 96)}%`,
            animationDuration: `${randomBetween(4, 9)}s`,
            animationDelay: `${randomBetween(0, 5)}s`,
            fontSize: `${randomBetween(0.8, 2.2)}rem`,
            opacity: randomBetween(0.15, 0.55),
          }}
        >
          {["💜", "🌸", "💗", "✨", "💕", "🦋"][i % 6]}
        </span>
      ))}

      <div className="loader-scene">
        <div className="loader-heart3d">
          <div className="heart-ring ring1" />
          <div className="heart-ring ring2" />
          <div className="heart-ring ring3" />
          <div className="heart-core">💜</div>
        </div>
      </div>

      <p className="loader-text">{texts[textIdx]}</p>

      <div className="loader-bar-wrap">
        <div className="loader-bar" style={{ width: `${progress}%` }} />
        <span className="loader-pct">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Stars & Petals
// ─────────────────────────────────────────────
function Stars() {
  const stars = Array.from({ length: TOTAL_STARS }, (_, i) => ({
    id: i,
    x: randomBetween(0, 100),
    y: randomBetween(0, 100),
    size: randomBetween(1.5, 3.5),
    delay: randomBetween(0, 4),
    duration: randomBetween(2, 5),
  }));
  return (
    <div className="stars-container">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function FloatingPetals() {
  const petals = Array.from({ length: TOTAL_PETALS }, (_, i) => ({
    id: i,
    x: randomBetween(0, 100),
    delay: randomBetween(0, 8),
    duration: randomBetween(6, 12),
    size: randomBetween(10, 22),
    rotate: randomBetween(0, 360),
  }));
  return (
    <div className="petals-container">
      {petals.map((p) => (
        <div
          key={p.id}
          className="petal"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Fireworks
// ─────────────────────────────────────────────
function Fireworks({ active }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    function burst() {
      const x = randomBetween(canvas.width * 0.2, canvas.width * 0.8);
      const y = randomBetween(canvas.height * 0.1, canvas.height * 0.5);
      const colors = ["#d8b4fe", "#f0abfc", "#c084fc", "#e879f9", "#fff", "#a855f7", "#fde68a", "#f9a8d4"];
      for (let i = 0; i < 60; i++) {
        const angle = (Math.PI * 2 * i) / 60;
        const speed = randomBetween(2, 7);
        particles.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          radius: randomBetween(2, 5),
        });
      }
    }

    let burstCount = 0;
    const burstInterval = setInterval(() => {
      burst();
      burstCount++;
      if (burstCount > 14) clearInterval(burstInterval);
    }, 350);

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter((p) => p.alpha > 0.05);
      particles.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.alpha -= 0.016;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      clearInterval(burstInterval);
      cancelAnimationFrame(animRef.current);
      particles.current = [];
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", top: 0, left: 0,
        pointerEvents: "none", zIndex: 50,
        display: active ? "block" : "none",
      }}
    />
  );
}

function FloatingHearts({ active }) {
  const hearts = ["💜", "🌸", "💗", "✨", "💫", "🦋", "💕", "🌟"];
  if (!active) return null;
  return (
    <div className="floating-hearts-burst">
      {Array.from({ length: 20 }, (_, i) => (
        <span
          key={i}
          className="burst-heart"
          style={{
            left: `${randomBetween(5, 95)}%`,
            animationDelay: `${randomBetween(0, 2)}s`,
            animationDuration: `${randomBetween(2.5, 5)}s`,
            fontSize: `${randomBetween(1.2, 2.4)}rem`,
          }}
        >
          {hearts[i % hearts.length]}
        </span>
      ))}
    </div>
  );
}

function AnimatedWords({ text, active }) {
  const words = text.split(" ");
  if (!active) return null;
  return (
    <div className="animated-words">
      {words.map((word, i) => (
        <span
          key={i}
          className="anim-word"
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          {word}&nbsp;
        </span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// MEMORIES
// ─────────────────────────────────────────────
const MEMORIES = [
  { img: process.env.PUBLIC_URL + "/photos/1.jpg", label: "Our first day 🌸", memory: "Remember how everything felt new, magical, and perfect?" },
  { img: process.env.PUBLIC_URL + "/photos/2.jpg", label: "Dancing in the rain 💜", memory: "We laughed so hard that day… I'd replay that moment forever." },
  { img: process.env.PUBLIC_URL + "/photos/3.jpg", label: "Best memories ✨", memory: "Every picture holds a thousand feelings only we understand." },
  { img: process.env.PUBLIC_URL + "/photos/4.jpg", label: "Every moment 🦋", memory: "Time stops when I'm with you — always has, always will." },
  { img: process.env.PUBLIC_URL + "/photos/5.jpg", label: "A scent we'll never forget 🌟", memory: "Some moments aren't captured on camera — they live in the heart." },
  { img: process.env.PUBLIC_URL + "/photos/6.jpg", label: "Always together 💕", memory: "No matter where life takes us, you'll always be my favourite chapter." },
];

function PhotoModal({ memories, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const [phase, setPhase] = useState("in");
  const total = memories.length;

  const navigate = useCallback((dir) => {
    setPhase("out");
    setTimeout(() => {
      setCurrent((c) => (c + dir + total) % total);
      setPhase("in");
    }, 420);
  }, [total]
  );

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    }
  }, [navigate, onClose]);

  const handleBackdrop = (e) => {
    if (e.target.classList.contains("modal-backdrop")) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className={`modal-img-wrap phase-${phase}`}>
          <img src={memories[current].img} alt={memories[current].label} className="modal-img" />
          <div className="modal-film-grain" />
        </div>
        <p className={`modal-label phase-${phase}`}>{memories[current].label}</p>
        <p className={`modal-memory-text phase-${phase}`}>{memories[current].memory}</p>
        <p className="modal-counter">{current + 1} / {total}</p>
        <button className="modal-arrow modal-arrow-left" onClick={() => navigate(-1)}>‹</button>
        <button className="modal-arrow modal-arrow-right" onClick={() => navigate(1)}>›</button>
        <div className="modal-dots">
          {memories.map((_, i) => (
            <span
              key={i}
              className={`modal-dot ${i === current ? "modal-dot-active" : ""}`}
              onClick={() => { setPhase("out"); setTimeout(() => { setCurrent(i); setPhase("in"); }, 420); }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MemoryCards({ active }) {
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState("in");
  const [modalIndex, setModalIndex] = useState(null);
  const [showMemText, setShowMemText] = useState(false);
  const total = MEMORIES.length;
  const autoRef = useRef(null);

  const goTo = useCallback((next) => {
    const target = ((next % total) + total) % total;
    setPhase("out");
    setShowMemText(false);
    setTimeout(() => {
      setCurrent(target);
      setPhase("in");
      setTimeout(() => setShowMemText(true), 400);
    }, 500);
  }, [total]
  );

  useEffect(() => {
    if (active) setTimeout(() => setShowMemText(true), 800);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    autoRef.current = setInterval(() => {
      setCurrent((c) => {
        const next = (c + 1) % total;
        setPhase("out");
        setShowMemText(false);
        setTimeout(() => { setCurrent(next); setPhase("in"); setTimeout(() => setShowMemText(true), 400); }, 500);
        return c;
      });
    }, 5000);
    return () => clearInterval(autoRef.current);
  }, [active, total]);

  if (!active) return null;

  return (
    <>
      {modalIndex !== null && (
        <PhotoModal memories={MEMORIES} startIndex={modalIndex} onClose={() => setModalIndex(null)} />
      )}
      <div className="memory-section">
        <div className="memory-title-wrap">
          <p className="memory-title">💜 Our Moments 💜</p>
          <p className="memory-subtitle">Every photo tells a story only we know…</p>
        </div>
        <div className="featured-wrap">
          <div className={`featured-img-box phase-${phase}`} onClick={() => setModalIndex(current)}>
            <img src={MEMORIES[current].img} alt={MEMORIES[current].label} className="featured-img" />
            <div className="film-grain" />
            <div className="vignette" />
            <div className="featured-overlay"><span className="featured-zoom-icon">🔍 View Memory</span></div>
          </div>
          <p className={`featured-label phase-${phase}`}>{MEMORIES[current].label}</p>
          <div className={`memory-quote ${showMemText ? "mem-text-in" : "mem-text-out"}`}>
            <span className="quote-mark">"</span>{MEMORIES[current].memory}<span className="quote-mark">"</span>
          </div>
          <button className="feat-arrow feat-arrow-left" onClick={() => { clearInterval(autoRef.current); goTo(current - 1); }}>‹</button>
          <button className="feat-arrow feat-arrow-right" onClick={() => { clearInterval(autoRef.current); goTo(current + 1); }}>›</button>
        </div>
        <div className="thumb-strip">
          {MEMORIES.map((m, i) => (
            <div key={i} className={`thumb-item ${i === current ? "thumb-active" : ""}`} onClick={() => { clearInterval(autoRef.current); goTo(i); }}>
              <img src={m.img} alt={m.label} className="thumb-img" />
            </div>
          ))}
        </div>
        <div className="memory-dots">
          {MEMORIES.map((_, i) => (
            <span key={i} className={`dot ${i === current ? "dot-active" : ""}`} onClick={() => { clearInterval(autoRef.current); goTo(i); }} />
          ))}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Sweet messages
// ─────────────────────────────────────────────
const MESSAGES = [
  "The world is more beautiful when you're in it 🌸",
  "Your smile makes my whole day brighter ☀️",
  "You are special — that's why I love you 💜",
  "Happy Birthday, my dream girl 🎂",
  "Every moment with you is pure magic ✨",
  "You make every ordinary day extraordinary 🌟",
  "My heart is yours, always and forever 💕",
];

// ─────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────
export default function App() {
  // appPhase: 'loading' -> 'countdown_lock' -> 'unlocked' -> 'celebration'
  const [appPhase, setAppPhase] = useState("loading");

  const [timeLeft, setTimeLeft] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [fireworks, setFireworks] = useState(false);
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [showPostBlow, setShowPostBlow] = useState(false);
  const [wordPhase, setWordPhase] = useState(0);

  const audioRef = useRef(null);

  const wishPhrases = [
    "Happy Birthday Love! 🎂",
    "You are so loved 💜",
    "Make a wish, beautiful! ✨",
  ];

  function handleLoaderDone() {
    if (Date.now() >= BIRTHDAY_UTC.getTime()) {
      setAppPhase("unlocked");
    } else {
      setAppPhase("countdown_lock");
    }
  }

  // Real-time tick logic for countdown popup
  useEffect(() => {
    if (appPhase !== "countdown_lock" && appPhase !== "unlocked") return;

    function calc() {
      const diff = BIRTHDAY_UTC.getTime() - Date.now();
      if (diff <= 0) {
        if (appPhase === "countdown_lock") {
          setAppPhase("unlocked");
          setFireworks(true); // small fireworks burst when unlocking
          setTimeout(() => setFireworks(false), 3000);
        }
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }
    calc(); // initial
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [appPhase]);

  // Handle entering the celebration -> transition & play music
  function startCelebration() {
    setAppPhase("celebration");
    setFireworks(true);
    setTimeout(() => setFireworks(false), 2500);

    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play failed: ", e));
    }
  }

  function handleCandles() {
    setCandlesBlown(true);
    setFireworks(true);
    setTimeout(() => setFireworks(false), 6000);
    setTimeout(() => setShowPostBlow(true), 800);
    let phase = 0;
    const interval = setInterval(() => {
      phase++;
      setWordPhase(phase);
      if (phase >= wishPhrases.length - 1) clearInterval(interval);
    }, 2000);
  }

  function handleReveal() {
    setRevealed(true);
    setFireworks(true);
    setTimeout(() => setFireworks(false), 5500);
  }

  return (
    <div className="app">
      <Stars />
      <FloatingPetals />
      <Fireworks active={fireworks} />
      <FloatingHearts active={showPostBlow} />

      {/* Background Audio */}
      <audio
        ref={audioRef}
        src={process.env.PUBLIC_URL + "/music/bg-music.mp3"}
        loop
      />

      {appPhase === "loading" && <LoveLoader onDone={handleLoaderDone} />}

      {/* Full Screen Glass Popup for Countdown/Intro */}
      {(appPhase === "countdown_lock" || appPhase === "unlocked") && (
        <div className="glass-popup-overlay">
          <div className={`glass-popup ${appPhase === 'unlocked' ? 'pulse-border' : ''}`}>
            {appPhase === "countdown_lock" && timeLeft ? (
              <>
                <h2 className="popup-title">Hold on, Sweety 🦋</h2>
                <p className="popup-subtitle">Your special day is almost here...</p>

                <div className="countdown-wrap">
                  <div className="countdown-units">
                    <div className="cd-unit">
                      <span className="cd-num">{timeLeft.days}</span>
                      <span className="cd-lbl">Days</span>
                    </div>
                    <span className="cd-sep">:</span>
                    <div className="cd-unit">
                      <span className="cd-num">{String(timeLeft.hours).padStart(2, "0")}</span>
                      <span className="cd-lbl">Hours</span>
                    </div>
                    <span className="cd-sep">:</span>
                    <div className="cd-unit">
                      <span className="cd-num">{String(timeLeft.minutes).padStart(2, "0")}</span>
                      <span className="cd-lbl">Mins</span>
                    </div>
                    <span className="cd-sep">:</span>
                    <div className="cd-unit">
                      <span className="cd-num">{String(timeLeft.seconds).padStart(2, "0")}</span>
                      <span className="cd-lbl">Secs</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="popup-unlocked-state">
                <h2 className="popup-title glow-title">🎉 Happy Birthday! 🎉</h2>
                <p className="popup-subtitle">The wait is over, the magic begins now.</p>
                <button className="enter-btn pop-in" onClick={startCelebration}>
                  Step into the Magic ✨
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content — rendered but slightly blurred/faded if not celebration */}
      <div className={`content ${appPhase !== "celebration" ? "content-hidden" : ""}`}>
        {/* Header */}
        <div className="header-glow">
          <p className="subtitle-top">✨ A special day for a special girl ✨</p>
          <h1 className="main-title">Happy Birthday</h1>
          <h2 className="name-title">Sweety Manikh</h2>
          <p className="date-badge">17 · April · 2026</p>
        </div>

        {/* Cake */}
        <div className="cake-section">
          <div className={`cake-wrapper ${candlesBlown ? "cake-glow" : ""}`}>
            <div className="cake">
              <div className="cake-top">
                {[0, 1, 2].map((i) => (
                  <div key={i} className={`candle-wrap ${candlesBlown ? "blown" : ""}`}>
                    <div className="candle" />
                    {!candlesBlown && <div className="flame" style={{ animationDelay: `${i * 0.3}s` }} />}
                    {candlesBlown && <div className="smoke" />}
                  </div>
                ))}
              </div>
              <div className="cake-body">
                <div className="cake-deco">🌸 💜 🌸</div>
              </div>
              <div className="cake-plate" />
            </div>
          </div>

          {!candlesBlown ? (
            <div className="blow-btn-wrap">
              <button
                className="blow-btn"
                onClick={handleCandles}
              >
                🎂 Blow the Candles!
              </button>
            </div>
          ) : (
            <div className="post-blow-area">
              {wishPhrases.map((phrase, i) => (
                <AnimatedWords key={i} text={phrase} active={wordPhase >= i} />
              ))}
            </div>
          )}
        </div>

        <MemoryCards active={showPostBlow} />

        {showPostBlow && (
          !revealed ? (
            <div className="reveal-section">
              <p className="reveal-hint">There's a special message waiting for you 💌</p>
              <button className="reveal-btn" onClick={handleReveal}>Open Your Gift 🎁</button>
            </div>
          ) : (
            <div className="message-box">
              <div className="msg-inner">
                <p className="msg-label">💜 From the heart 💜</p>
                <p className="msg-text">{MESSAGES[msgIndex]}</p>
                <div className="msg-progress">
                  {MESSAGES.map((_, i) => (
                    <span key={i} className={`msg-dot ${i === msgIndex ? "msg-dot-active" : ""}`} />
                  ))}
                </div>
                <button className="next-msg-btn" onClick={() => setMsgIndex((i) => (i + 1) % MESSAGES.length)}>Next Message 💫</button>
              </div>
            </div>
          )
        )}

        {/* Wish Card */}
        <div className="wish-card">
          <h3>On your special day...</h3>
          <p>
            Sweety, the day you were born was the greatest gift the world ever received.
            Your smile, your love — every little thing about you is beautiful.
            May this year bring you all the happiness you truly deserve. 🌸
          </p>
          <div className="hearts-row">
            {["💜", "🌸", "✨", "🦋", "💫"].map((e, i) => (
              <span key={i} className="floating-emoji" style={{ animationDelay: `${i * 0.4}s` }}>{e}</span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <p>Made with 💜 just for you, Manikh</p>
        </div>
      </div>
    </div>
  );
}