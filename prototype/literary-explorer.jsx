import { useState, useEffect, useRef } from "react";

// ── Mock data ────────────────────────────────────────────────────────────────
const SEGMENTS = [
  {
    id: 1,
    novel: "The Drowned City",
    author: "E. Marlowe",
    year: 1931,
    openingLine: "The water had been rising for three days before anyone thought to leave.",
    text: `The water had been rising for three days before anyone thought to leave. It came in quietly at first — a dark seam along the skirting boards, a cool dampness underfoot that you might mistake for a draft from the cellar. Marguerite noticed it on the Tuesday, when she found her shoes floating under the kitchen table like small brown boats.

By Wednesday the neighbours were on their rooftops. By Thursday, the rooftops themselves had become uncertain things.

She did not leave. She had lived in this house for forty years and she could not imagine the geometry of a life arranged elsewhere. The water rose through the parlour and she moved the photographs to higher shelves. It rose through the hallway and she retreated to the landing. There was something almost companionable about it, she thought. The house settling around her like a held breath.

Outside, the city had become a kind of mirror. Every spire and chimney stack reached down into its own reflection, and the sky, for the first time in living memory, lay beneath everyone's feet.`,
    metadata: { mood: "melancholic", themes: ["displacement", "memory", "resilience"], setting: "flooded city", characters: ["Marguerite"] }
  },
  {
    id: 2,
    novel: "Letters Never Sent",
    author: "C. Beaumont",
    year: 1958,
    openingLine: "I found your handwriting in a book I'd never read.",
    text: `I found your handwriting in a book I'd never read. A small annotation in the margin of page forty-four — three words, your hand unmistakable even after all these years, the particular way you made your lowercase g like a question refusing to close.

The book was a collection of astronomical essays. I had pulled it from the shelf of a shop in Lisbon entirely at random, or what I thought was random, and there you were.

I bought it, of course. I sat with it in the café across the street and read every marginal note you had left — there were eleven in total, scattered across chapters about stellar drift and the cooling of white dwarfs. Most were simple: a question mark, a date, occasionally a single word like yes or impossible or beautiful. On page one hundred and twelve you had written, in full: this is exactly how it feels to miss someone.

I don't know when you were in Lisbon. I don't know how the book got there. But I carried it home and put it on my nightstand, and some nights I open it to page one hundred and twelve and leave it there, face down, so the words stay warm.`,
    metadata: { mood: "tender", themes: ["love", "loss", "chance"], setting: "Lisbon", characters: ["unnamed narrator"] }
  },
  {
    id: 3,
    novel: "The Glass Cartographer",
    author: "O. Vance",
    year: 1972,
    openingLine: "Every map she made was of a place that no longer existed.",
    text: `Every map she made was of a place that no longer existed. This was not a flaw in her technique — her measurements were precise, her hand steady, her inks archival. It was simply that by the time a map was finished, the place had moved on.

Cities do this. They shed buildings the way trees shed leaves, and new things grow in the gaps that bear no resemblance to what came before. Helena understood this better than anyone. She had been mapping the same city for thirty years and had never once produced the same map twice.

Her studio was a chronicle of these transformations. Rolled canvases lined every wall, each one labelled with a date. On the far wall, the oldest ones. The city they showed was almost unrecognisable — different streets, different alignments, a canal where now there was a market, a square where now there was a motorway. People came occasionally to look at them, as though they were portraits of the dead.

"Where is this?" a young student asked once, pointing at a detailed rendering from 1951.

"Here," Helena said. "It's always been here. It just doesn't remember."`,
    metadata: { mood: "contemplative", themes: ["time", "memory", "change"], setting: "unnamed city", characters: ["Helena"] }
  },
  {
    id: 4,
    novel: "Salt & Ember",
    author: "M. Osei",
    year: 2003,
    openingLine: "My grandmother kept her grief in a tin on the highest shelf.",
    text: `My grandmother kept her grief in a tin on the highest shelf. It was an old biscuit tin, the kind with a painted hunting scene on the lid — horses mid-leap, a sky the colour of a bruise. She never opened it in front of us, but we knew what was inside. Or we thought we did.

After she died, we found the tin during the clearing out. My aunt lifted it down and held it for a long moment before passing it to me. It was lighter than I expected. Grief, I had always imagined, would have weight.

Inside: three photographs, a train ticket from 1963, a pressed flower that had long since lost its colour, and a letter written in a hand none of us recognised. The letter was in a language my grandmother had never, to our knowledge, spoken. We had it translated eventually.

It was a recipe. For something called mafe — a peanut stew, rich and slow-cooked, the kind that takes all day. The margins were covered in notes: more ginger, less salt next time, K. likes it without the chilli.

We made it that winter, all of us together in her kitchen. We didn't know who K. was. We didn't ask. Some griefs come with instructions.`,
    metadata: { mood: "bittersweet", themes: ["grief", "heritage", "family"], setting: "family home", characters: ["narrator", "grandmother", "aunt"] }
  },
  {
    id: 5,
    novel: "The Isthmus Protocol",
    author: "R. Szymański",
    year: 2019,
    openingLine: "The last honest clock in the city stopped at 3:17 on a Thursday.",
    text: `The last honest clock in the city stopped at 3:17 on a Thursday. All the others had been adjusted years ago, gradually, by degrees so small that nobody had noticed the cumulative drift. The city ran now on a time of its own devising — twelve minutes behind the rest of the world, though nobody could agree whether this was a malfunction or a policy.

Declan worked in the Ministry of Synchronisation, which had long since abandoned any interest in synchronisation. His job was to maintain the official records of what time it was, and to ensure these records were consistent with themselves, if not necessarily with anything external. It was painstaking work. It required a very particular kind of mind.

"The question isn't what time it actually is," his supervisor had explained on his first day. "The question is what time we need it to be."

Outside his window, the adjusted clocks ticked their adjusted seconds. The city moved through its days in its own comfortable lag. Nobody caught early trains. Nobody was late for anything. In the absence of a shared reality, they had achieved a perfect consensus.

Declan kept his watch set twelve minutes fast, which meant he kept his watch set to the truth, which meant he was always, in this city, slightly ahead of himself.`,
    metadata: { mood: "satirical", themes: ["bureaucracy", "truth", "time"], setting: "dystopian city", characters: ["Declan"] }
  },
  {
    id: 6,
    novel: "Nightswimming",
    author: "A. Ferreira",
    year: 1987,
    openingLine: "We swam out further than we should have, and it was perfect.",
    text: `We swam out further than we should have, and it was perfect. The beach lights were small and orange behind us, and ahead there was only the dark water and the darker sky and the particular silence that exists between them. Tomás was ahead of me. He always swam ahead — not to beat me, but because he was happiest at the edge of things.

"Stop here," I said, and he did, and we floated on our backs in the warm Atlantic and looked up at the stars.

This was the summer I was seventeen. I remember it with a completeness I don't usually trust in memory — the exact temperature of the water, the smell of the salt, the sound of Tomás breathing beside me. Some summers leave themselves in you entire. This one never left at all.

We didn't speak much. Tomás pointed out constellations and I pretended to see them. At some point I became aware that I was very happy, and the awareness of it made it both more real and more frightening, the way looking directly at something bright will sometimes make it disappear.

We swam back eventually. We always swam back.

I have been swimming back from that night for thirty years.`,
    metadata: { mood: "nostalgic", themes: ["youth", "friendship", "loss"], setting: "Portuguese coast", characters: ["narrator", "Tomás"] }
  }
];

const RELATED = {
  1: [3, 5, 2],
  2: [6, 4, 1],
  3: [1, 5, 6],
  4: [2, 6, 3],
  5: [3, 1, 4],
  6: [2, 4, 3],
};

const MOOD_COLORS = {
  melancholic: "#7B9EAE",
  tender: "#C4956A",
  contemplative: "#8A9B7C",
  bittersweet: "#B07A8A",
  satirical: "#8A8AAA",
  nostalgic: "#A89070",
};

// ── Components ───────────────────────────────────────────────────────────────

function GrainOverlay() {
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
      opacity: 0.4,
    }} />
  );
}

function OpeningScreen({ segments, onSelect, onSearch, searchQuery, setSearchQuery }) {
  const [visible, setVisible] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "60px 24px",
    }}>
      {/* Header */}
      <div style={{
        textAlign: "center", marginBottom: "64px",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "all 1s ease",
      }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: "var(--muted)", marginBottom: "16px", textTransform: "uppercase" }}>
          A literary journey
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
          fontWeight: 400, color: "var(--cream)", lineHeight: 1.1,
          margin: 0, letterSpacing: "-0.02em",
        }}>
          Where will the words<br />
          <span style={{ fontStyle: "italic", color: "var(--amber)" }}>take you?</span>
        </h1>
      </div>

      {/* Search */}
      <div style={{
        width: "100%", maxWidth: "560px", marginBottom: "56px",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "all 1s ease 0.2s",
      }}>
        <div style={{ position: "relative" }}>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && searchQuery.trim() && onSearch()}
            placeholder="Describe a feeling, scene, or moment…"
            style={{
              width: "100%", background: "transparent",
              border: "none", borderBottom: "1px solid var(--border)",
              color: "var(--cream)", fontSize: "18px",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic", padding: "12px 48px 12px 0",
              outline: "none", boxSizing: "border-box",
              caretColor: "var(--amber)",
            }}
          />
          <button
            onClick={() => searchQuery.trim() && onSearch()}
            style={{
              position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: searchQuery.trim() ? "var(--amber)" : "var(--muted)",
              fontSize: "20px", transition: "color 0.2s",
            }}
          >→</button>
        </div>
        <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "10px", letterSpacing: "0.15em" }}>
          OR CHOOSE AN OPENING LINE BELOW
        </div>
      </div>

      {/* Opening lines */}
      <div style={{
        width: "100%", maxWidth: "760px",
        display: "grid", gap: "2px",
      }}>
        {segments.map((seg, i) => {
          const moodColor = MOOD_COLORS[seg.metadata.mood] || "var(--amber)";
          const isHovered = hoveredId === seg.id;
          return (
            <div
              key={seg.id}
              onClick={() => onSelect(seg)}
              onMouseEnter={() => setHoveredId(seg.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                padding: "20px 28px",
                cursor: "pointer",
                borderLeft: `2px solid ${isHovered ? moodColor : "transparent"}`,
                background: isHovered ? "rgba(255,255,255,0.03)" : "transparent",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(-16px)",
                transition: `all 0.8s ease ${0.3 + i * 0.08}s, border-color 0.2s, background 0.2s`,
              }}
            >
              <p style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(16px, 2.5vw, 20px)",
                fontStyle: "italic",
                color: isHovered ? "var(--cream)" : "var(--text)",
                margin: "0 0 8px 0",
                lineHeight: 1.4,
                transition: "color 0.2s",
              }}>
                "{seg.openingLine}"
              </p>
              <div style={{
                fontSize: "11px", letterSpacing: "0.2em",
                color: isHovered ? moodColor : "var(--muted)",
                transition: "color 0.2s", textTransform: "uppercase",
              }}>
                {isHovered ? `${seg.novel} · ${seg.author}` : "· · ·"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReadingScreen({ segment, trail, onNext, onBack }) {
  const [phase, setPhase] = useState("entering"); // entering | reading | revealing | choosing
  const [nextOptions, setNextOptions] = useState([]);
  const textRef = useRef(null);
  const moodColor = MOOD_COLORS[segment.metadata.mood] || "var(--amber)";

  useEffect(() => {
    setPhase("entering");
    const t = setTimeout(() => setPhase("reading"), 600);
    return () => clearTimeout(t);
  }, [segment.id]);

  const handleReveal = () => {
    setPhase("revealing");
    const relatedIds = RELATED[segment.id] || [];
    const options = relatedIds.map(id => SEGMENTS.find(s => s.id === id)).filter(Boolean);
    setTimeout(() => {
      setNextOptions(options);
      setPhase("choosing");
    }, 800);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "24px 40px", borderBottom: "1px solid var(--border)",
        opacity: phase === "entering" ? 0 : 1, transition: "opacity 0.8s ease 0.3s",
      }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", color: "var(--muted)",
          cursor: "pointer", fontSize: "13px", letterSpacing: "0.15em",
          textTransform: "uppercase", padding: 0,
        }}>← Begin again</button>

        {/* Trail */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {trail.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: i === trail.length - 1 ? moodColor : "var(--muted)",
                transition: "background 0.3s",
              }} />
              {i < trail.length - 1 && <div style={{ width: "20px", height: "1px", background: "var(--border)" }} />}
            </div>
          ))}
        </div>

        <div style={{ width: "80px" }} />
      </div>

      {/* Main content */}
      <div style={{
        flex: 1, maxWidth: "680px", margin: "0 auto", padding: "60px 40px",
        width: "100%", boxSizing: "border-box",
      }}>
        {/* Novel info - always visible */}
        <div style={{
          marginBottom: "40px",
          opacity: phase === "entering" ? 0 : 1,
          transform: phase === "entering" ? "translateY(-8px)" : "translateY(0)",
          transition: "all 0.6s ease",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "12px",
            padding: "8px 16px", border: `1px solid ${moodColor}22`,
            borderLeft: `2px solid ${moodColor}`,
          }}>
            <span style={{ fontSize: "12px", letterSpacing: "0.2em", color: moodColor, textTransform: "uppercase" }}>
              {segment.metadata.mood}
            </span>
            <span style={{ color: "var(--border)" }}>·</span>
            <span style={{ fontSize: "13px", color: "var(--muted)", fontStyle: "italic", fontFamily: "'Playfair Display', Georgia, serif" }}>
              {segment.novel}
            </span>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              {segment.author}, {segment.year}
            </span>
          </div>
        </div>

        {/* Text */}
        <div ref={textRef} style={{
          opacity: phase === "entering" ? 0 : 1,
          transform: phase === "entering" ? "translateY(12px)" : "translateY(0)",
          transition: "all 0.9s ease 0.2s",
        }}>
          {segment.text.split("\n\n").map((para, i) => (
            <p key={i} style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(17px, 2.2vw, 20px)",
              lineHeight: 1.8,
              color: "var(--text)",
              marginBottom: "1.6em",
              margin: i === 0 ? "0 0 1.6em 0" : "0 0 1.6em 0",
            }}>
              {i === 0 ? (
                <>
                  <span style={{
                    float: "left", fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "4.5em", lineHeight: 0.75, marginRight: "8px",
                    marginTop: "8px", color: moodColor,
                  }}>
                    {para[0]}
                  </span>
                  {para.slice(1)}
                </>
              ) : para}
            </p>
          ))}
        </div>

        {/* Themes */}
        <div style={{
          marginTop: "48px", display: "flex", gap: "8px", flexWrap: "wrap",
          opacity: phase === "choosing" ? 1 : 0, transition: "opacity 0.5s ease",
        }}>
          {segment.metadata.themes.map(theme => (
            <span key={theme} style={{
              fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase",
              color: "var(--muted)", border: "1px solid var(--border)",
              padding: "4px 10px",
            }}>{theme}</span>
          ))}
          <span style={{
            fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase",
            color: "var(--muted)", border: "1px solid var(--border)",
            padding: "4px 10px",
          }}>{segment.metadata.setting}</span>
        </div>

        {/* CTA */}
        {phase === "reading" && (
          <div style={{ marginTop: "56px", textAlign: "center" }}>
            <button onClick={handleReveal} style={{
              background: "none", border: "1px solid var(--border)",
              color: "var(--text)", cursor: "pointer", padding: "14px 36px",
              fontSize: "13px", letterSpacing: "0.25em", textTransform: "uppercase",
              fontFamily: "inherit", transition: "all 0.2s",
            }}
              onMouseEnter={e => {
                e.target.style.borderColor = moodColor;
                e.target.style.color = moodColor;
              }}
              onMouseLeave={e => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.color = "var(--text)";
              }}
            >
              Continue the journey
            </button>
          </div>
        )}

        {/* Next options */}
        {phase === "choosing" && (
          <div style={{ marginTop: "64px", borderTop: "1px solid var(--border)", paddingTop: "48px" }}>
            <div style={{
              fontSize: "11px", letterSpacing: "0.3em", color: "var(--muted)",
              textTransform: "uppercase", marginBottom: "32px",
            }}>
              Where next?
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {nextOptions.map((opt, i) => {
                const optMood = MOOD_COLORS[opt.metadata.mood] || "var(--amber)";
                return (
                  <div
                    key={opt.id}
                    onClick={() => onNext(opt)}
                    style={{
                      padding: "20px 24px",
                      cursor: "pointer",
                      borderLeft: "2px solid transparent",
                      transition: "all 0.2s",
                      opacity: 0,
                      animation: `fadeSlideIn 0.5s ease ${i * 0.12}s forwards`,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderLeftColor = optMood;
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderLeftColor = "transparent";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <p style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: "18px", fontStyle: "italic",
                      color: "var(--text)", margin: "0 0 8px 0", lineHeight: 1.4,
                    }}>
                      "{opt.openingLine}"
                    </p>
                    <div style={{
                      fontSize: "11px", letterSpacing: "0.2em",
                      color: optMood, textTransform: "uppercase",
                    }}>
                      {opt.metadata.mood} · {opt.novel}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("opening");
  const [currentSegment, setCurrentSegment] = useState(null);
  const [trail, setTrail] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Pick 5 random segments for opening lines
  const [openingSegments] = useState(() => {
    const shuffled = [...SEGMENTS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  });

  const handleSelect = (segment) => {
    setCurrentSegment(segment);
    setTrail([segment]);
    setScreen("reading");
  };

  const handleSearch = () => {
    // In production: vector similarity search. For prototype, pick random segment.
    const random = SEGMENTS[Math.floor(Math.random() * SEGMENTS.length)];
    handleSelect(random);
  };

  const handleNext = (segment) => {
    setCurrentSegment(segment);
    setTrail(prev => [...prev, segment]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setScreen("opening");
    setCurrentSegment(null);
    setTrail([]);
    setSearchQuery("");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&display=swap');

        :root {
          --bg: #1c1a16;
          --cream: #f0ead8;
          --text: #c8bfa8;
          --muted: #6b6358;
          --border: #3a3530;
          --amber: #c8963c;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1c1a16; }

        input::placeholder { color: #5a5448; }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0d0c0a; }
        ::-webkit-scrollbar-thumb { background: #2a2620; }
      `}</style>
      <GrainOverlay />

      {screen === "opening" && (
        <OpeningScreen
          segments={openingSegments}
          onSelect={handleSelect}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {screen === "reading" && currentSegment && (
        <ReadingScreen
          segment={currentSegment}
          trail={trail}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
    </>
  );
}
