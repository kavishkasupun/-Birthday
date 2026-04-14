import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

const TOTAL_STARS = 80;
const TOTAL_PETALS = 18;

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

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

function Fireworks({ active }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

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
// MEMORIES — update img paths & labels here
// Put your photos in  public/photos/1.jpg etc.
// ─────────────────────────────────────────────
const MEMORIES = [
  { img: "/photos/1.jpg", label: "Our first day 🌸" },
  { img: "/photos/2.jpg", label: "Dancing in the rain 💜" },
  { img: "/photos/3.jpg", label: "Best memories ✨" },
  { img: "/photos/4.jpg", label: "Every moment 🦋" },
  { img: "/photos/5.jpg", label: "A scent we'll never forget 🌟" },
  { img: "/photos/6.jpg", label: "Always together 💕" },
];

// ─────────────────────────────────────────────
// Full-screen Photo Modal
// ─────────────────────────────────────────────
function PhotoModal({ memories, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const [phase, setPhase] = useState("in");
  const total = memories.length;

  const handleBackdrop = (e) => {
    if (e.target.classList.contains("modal-backdrop")) onClose();
  };

  const navigate = useCallback(
    (dir) => {
      setPhase("out");
      setTimeout(() => {
        setCurrent((c) => (c + dir + total) % total);
        setPhase("in");
      }, 420);
    },
    [total]
  );

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, onClose]);

  // Prevent body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className={`modal-img-wrap phase-${phase}`}>
          <img
            src={memories[current].img}
            alt={memories[current].label}
            className="modal-img"
          />
        </div>

        <p className={`modal-label phase-${phase}`}>{memories[current].label}</p>
        <p className="modal-counter">{current + 1} / {total}</p>

        <button className="modal-arrow modal-arrow-left" onClick={() => navigate(-1)}>‹</button>
        <button className="modal-arrow modal-arrow-right" onClick={() => navigate(1)}>›</button>

        <div className="modal-dots">
          {memories.map((_, i) => (
            <span
              key={i}
              className={`modal-dot ${i === current ? "modal-dot-active" : ""}`}
              onClick={() => {
                setPhase("out");
                setTimeout(() => { setCurrent(i); setPhase("in"); }, 420);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Memory Carousel — large featured + thumbnails
// Auto-slides with zoom+fade transition
// ─────────────────────────────────────────────
function MemoryCards({ active }) {
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState("in");
  const [modalIndex, setModalIndex] = useState(null);
  const total = MEMORIES.length;
  const autoRef = useRef(null);

  const goTo = useCallback(
    (next) => {
      const target = ((next % total) + total) % total;
      setPhase("out");
      setTimeout(() => {
        setCurrent(target);
        setPhase("in");
      }, 500);
    },
    [total]
  );

  // Auto-advance every 4 seconds
  useEffect(() => {
    if (!active) return;
    autoRef.current = setInterval(() => {
      setCurrent((c) => {
        const next = (c + 1) % total;
        setPhase("out");
        setTimeout(() => {
          setCurrent(next);
          setPhase("in");
        }, 500);
        return c; // don't change yet — wait for timeout
      });
    }, 4000);
    return () => clearInterval(autoRef.current);
  }, [active, total]);

  const handleNav = (dir) => {
    clearInterval(autoRef.current);
    goTo(current + dir);
  };

  if (!active) return null;

  return (
    <>
      {modalIndex !== null && (
        <PhotoModal
          memories={MEMORIES}
          startIndex={modalIndex}
          onClose={() => setModalIndex(null)}
        />
      )}

      <div className="memory-section">
        <p className="memory-title">💜 Our Moments 💜</p>

        {/* Large featured photo */}
        <div className="featured-wrap">
          <div
            className={`featured-img-box phase-${phase}`}
            onClick={() => setModalIndex(current)}
            title="Click to view full screen"
          >
            <img
              src={MEMORIES[current].img}
              alt={MEMORIES[current].label}
              className="featured-img"
            />
            <div className="featured-overlay">
              <span className="featured-zoom-icon">🔍 View</span>
            </div>
          </div>

          <p className={`featured-label phase-${phase}`}>
            {MEMORIES[current].label}
          </p>

          {/* Navigation arrows */}
          <button className="feat-arrow feat-arrow-left" onClick={() => handleNav(-1)}>‹</button>
          <button className="feat-arrow feat-arrow-right" onClick={() => handleNav(1)}>›</button>
        </div>

        {/* Thumbnail strip */}
        <div className="thumb-strip">
          {MEMORIES.map((m, i) => (
            <div
              key={i}
              className={`thumb-item ${i === current ? "thumb-active" : ""}`}
              onClick={() => {
                clearInterval(autoRef.current);
                goTo(i);
              }}
            >
              <img src={m.img} alt={m.label} className="thumb-img" />
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="memory-dots">
          {MEMORIES.map((_, i) => (
            <span
              key={i}
              className={`dot ${i === current ? "dot-active" : ""}`}
              onClick={() => { clearInterval(autoRef.current); goTo(i); }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Birthday Countdown
// ─────────────────────────────────────────────
function BirthdayCountdown() {
  const birthday = new Date("2026-04-17");
  const today = new Date();
  const isToday =
    today.getDate() === birthday.getDate() &&
    today.getMonth() === birthday.getMonth() &&
    today.getFullYear() === birthday.getFullYear();
  const diff = Math.ceil((birthday - today) / (1000 * 60 * 60 * 24));
  if (isToday) return <div className="countdown-badge today-badge">🎉 Today is the day! 🎉</div>;
  if (diff > 0) return <div className="countdown-badge">🗓️ <strong>{diff}</strong> days until the big day!</div>;
  return null;
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
  const [revealed, setRevealed] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [fireworks, setFireworks] = useState(false);
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [showPostBlow, setShowPostBlow] = useState(false);
  const [wordPhase, setWordPhase] = useState(0);

  const wishPhrases = [
    "Happy Birthday Supuni! 🎂",
    "You are so loved 💜",
    "Make a wish, beautiful! ✨",
  ];

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

  function nextMsg() {
    setMsgIndex((i) => (i + 1) % MESSAGES.length);
  }

  return (
    <div className="app">
      <Stars />
      <FloatingPetals />
      <Fireworks active={fireworks} />
      <FloatingHearts active={showPostBlow} />

      <div className="content">
        {/* Header */}
        <div className="header-glow">
          <BirthdayCountdown />
          <p className="subtitle-top">✨ A special day for a special girl ✨</p>
          <h1 className="main-title">Happy Birthday</h1>
          <h2 className="name-title">Supuni Udeshika</h2>
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
            <button className="blow-btn" onClick={handleCandles}>
              🎂 Blow the Candles!
            </button>
          ) : (
            <div className="post-blow-area">
              {wishPhrases.map((phrase, i) => (
                <AnimatedWords key={i} text={phrase} active={wordPhase >= i} />
              ))}
            </div>
          )}
        </div>

        {/* Memory Carousel — appears after candles blown */}
        <MemoryCards active={showPostBlow} />

        {/* Reveal */}
        {!revealed ? (
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
              <button className="next-msg-btn" onClick={nextMsg}>Next Message 💫</button>
            </div>
          </div>
        )}

        {/* Wish Card */}
        <div className="wish-card">
          <h3>On your special day...</h3>
          <p>
            Supuni, the day you were born was the greatest gift the world ever received.
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
          <p>Made with 💜 just for you, Supuni</p>
        </div>
      </div>
    </div>
  );
}