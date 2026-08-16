import { useState, useRef, useEffect, useContext, useMemo } from 'react';
import { CATEGORIES, FAQS, SMALL_TALK } from '../data/chatbotData';
import { PHONE, EMAIL } from '../data/contactInfo';
import servicesData from '../pages/services/servicesData';
import { ShopContext } from '../pages/shop/ShopContext';
import chatbotIcon from '../assets/icon/chatbot-icon.png';
import '../styles/chatbot.css';
import { API_BASE_URL } from '../config/api';

const API_BASE = `${API_BASE_URL}/api/chatbot`;

// Live intents can't be answered from the fixed FAQ list — they need a
// real request to the backend. Each one has its own fetcher below.
const LIVE_INTENTS = {
  'appointment-status': fetchAppointmentStatus,
  'order-status': fetchOrderStatus,
};

async function fetchAppointmentStatus() {
  const res = await fetch(`${API_BASE}/appointment-status`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('lookup failed');
  const rows = await res.json();
  if (!rows.length) {
    return "You don't have any appointments on file yet. Head to the Appointments page to book one.";
  }
  const lines = rows.slice(0, 5).map(
    (a) => `• ${a.service} on ${a.appt_date} at ${a.appt_time} — ${a.status}`
  );
  return `Here's what I found on your account:\n${lines.join('\n')}`;
}

async function fetchOrderStatus() {
  const res = await fetch(`${API_BASE}/order-status`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('lookup failed');
  const rows = await res.json();
  if (!rows.length) {
    return "I don't see any orders on your account yet. Head to the Shop to place one.";
  }
  const lines = rows.slice(0, 5).map(
    (o) => `• Order #${o.id} — ${o.item_count} item(s), Rs. ${o.total} — ${o.payment_status || 'Pending'} (${o.created_at})`
  );
  return `Here's what I found on your account:\n${lines.join('\n')}`;
}

// Score every FAQ against the typed text and return the best match
// (or null if nothing scores above the threshold). Deliberately simple:
// substring hits on multi-word keywords + single-word overlap.
function matchFAQ(text) {
  const clean = text.toLowerCase().trim().replace(/[?!.,]/g, '');
  if (!clean) return null;
  const words = clean.split(/\s+/).filter(Boolean);

  let best = null;
  let bestScore = 0;

  for (const faq of FAQS) {
    let score = 0;
    for (const kw of faq.keywords) {
      if (kw.includes(' ')) {
        if (clean.includes(kw)) score += 3; // phrase match is a strong signal
      } else if (words.includes(kw)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }
  return bestScore > 0 ? best : null;
}

// ---------------------------------------------------------------------------
// Catalog finder — when someone describes what they need in plain language
// ("my dog needs a haircut", "food for my budgie") rather than asking an FAQ
// question, match it against the real services/products catalog and answer
// with the specific thing, not a generic FAQ blurb. Runs before the AI
// fallback so common "find me X" phrasing gets an instant, accurate answer.
// ---------------------------------------------------------------------------

const STOPWORDS = new Set(['the', 'and', 'for', 'with', 'my', 'your', 'you', 'have', 'has', 'need', 'needs', 'want', 'wants', 'looking', 'find', 'get', 'got', 'some', 'any', 'that', 'this', 'are', 'can', 'pet', 'pets']);

function keywordsFromText(text) {
  return text
    .toLowerCase()
    .replace(/[&/]/g, ' ')
    .split(/\W+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

// Strip a trailing "s" so "cats"/"cat", "birds"/"bird" etc. line up.
function stem(w) {
  return w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w;
}

function scoreOverlap(userWords, itemWords) {
  const userStems = new Set(userWords.map(stem));
  let score = 0;
  for (const w of itemWords) {
    // Longer words are more specific ("budgie") and worth more than short,
    // generic ones ("dog", "food") — a single specific hit should be enough
    // to trigger a match, but generic words need to line up more than once.
    if (userStems.has(stem(w))) score += w.length >= 5 ? 2 : 1;
  }
  return score;
}

const SERVICE_KEYWORDS = servicesData.map((s) => ({
  service: s,
  words: keywordsFromText([s.category, s.title, ...(s.tags || [])].join(' ')),
}));

// Product keywords depend on the live cart's product list (real DB data,
// see ShopContext), so this is built inside the component with useMemo
// rather than at module load — the static list here would go stale the
// moment an admin adds/edits products.
function buildProductKeywords(products) {
  return products.map((p) => ({
    product: p,
    words: keywordsFromText([p.cat, p.name].join(' ')),
  }));
}

// Returns { type: 'service' | 'product', item } for the best catalog match,
// or null if nothing scores highly enough to be worth answering directly
// (a weak/ambiguous match is better left to the AI fallback or FAQ list).
function matchCatalog(text, productKeywords) {
  const userWords = keywordsFromText(text);
  if (userWords.length === 0) return null;

  let best = null;
  let bestScore = 0;

  for (const { service, words } of SERVICE_KEYWORDS) {
    const score = scoreOverlap(userWords, words);
    if (score > bestScore) {
      bestScore = score;
      best = { type: 'service', item: service };
    }
  }
  for (const { product, words } of productKeywords) {
    const score = scoreOverlap(userWords, words);
    if (score > bestScore) {
      bestScore = score;
      best = { type: 'product', item: product };
    }
  }

  return bestScore >= 2 ? best : null;
}

// Some fixed FAQs are effectively about one specific bookable service
// ("Do you offer boarding or daycare?", "What does grooming include?") —
// those get a one-tap "Book" chip added onto their normal answer, so the
// informational text is kept but there's still an immediate next step.
// Scoped to the booking/services FAQ categories only — e.g. the emergency
// FAQ's advice is "call now", not "book online", so it's deliberately
// excluded even though it'd score high against the Emergency service.
function findRelatedService(faq) {
  const words = keywordsFromText([faq.question, ...(faq.keywords || [])].join(' '));
  let best = null;
  let bestScore = 0;
  for (const { service, words: itemWords } of SERVICE_KEYWORDS) {
    const score = scoreOverlap(words, itemWords);
    if (score > bestScore) {
      bestScore = score;
      best = service;
    }
  }
  return bestScore >= 2 ? best : null;
}

const FAQ_SERVICE_MAP = new Map(
  FAQS
    .filter((faq) => faq.category === 'booking' || faq.category === 'services')
    .map((faq) => [faq.id, findRelatedService(faq)])
    .filter(([, service]) => service)
);

// Simple, human, one-line commands ("hi", "thanks", "bye"...) — checked
// ahead of the FAQ matcher so they get an instant, natural reply instead
// of being logged as unanswered and sent to the AI fallback.
function matchSmallTalk(text) {
  const clean = text.toLowerCase().trim();
  if (!clean) return null;
  return SMALL_TALK.find((item) => item.pattern.test(clean)) || null;
}

let msgId = 0;
const nextId = () => `m${++msgId}`;

function makeBotMsg(text, extra = {}) {
  return { id: nextId(), from: 'bot', text, ...extra };
}
function makeUserMsg(text) {
  return { id: nextId(), from: 'user', text };
}

const DRAFT_KEY = 'vinucare-chatbot-draft';

export default function ChatBot({ user, onNavigate, onBookService }) {
  const { products, addToCart } = useContext(ShopContext);
  const productKeywords = useMemo(() => buildProductKeywords(products), [products]);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [
    makeBotMsg(
      "Hi! I'm the VinuCare assistant. Pick a topic below, or just type your question.",
      { chips: CATEGORIES.map((c) => ({ label: c.label, action: { type: 'category', id: c.id } })) }
    ),
  ]);
  // Persisted to localStorage (not just component state) so an unsent
  // draft survives closing the panel, navigating to a page that
  // unmounts this component entirely (see App.jsx's page allowlist for
  // where it's rendered), or even a page refresh.
  const [input, setInput] = useState(() => {
    try { return localStorage.getItem(DRAFT_KEY) || ''; } catch { return ''; }
  });
  const [isThinking, setIsThinking] = useState(false);
  const bodyRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, isThinking, isOpen]);

  useEffect(() => {
    try {
      if (input) localStorage.setItem(DRAFT_KEY, input);
      else localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore write failures (e.g. private browsing)
    }
  }, [input]);

  // Click-away-to-close, same pattern as the nav's account dropdown.
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  function pushBot(text, extra) {
    setMessages((m) => [...m, makeBotMsg(text, extra)]);
  }

  function showCategory(categoryId) {
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    const qs = FAQS.filter((f) => f.category === categoryId);
    pushBot(`${cat.label} — what do you need?`, {
      chips: [
        ...qs.map((q) => ({ label: q.question, action: { type: 'faq', id: q.id } })),
        { label: '⬅ Back to topics', action: { type: 'menu' } },
      ],
    });
  }

  function showMenu() {
    pushBot('Sure — what would you like to know about?', {
      chips: CATEGORIES.map((c) => ({ label: c.label, action: { type: 'category', id: c.id } })),
    });
  }

  async function answerFaq(faq) {
    if (faq.liveIntent) {
      if (!user) {
        pushBot("You'll need to be logged in for me to look that up for you.", {
          chips: [
            { label: 'Log in', action: { type: 'login' } },
            { label: '⬅ Back to topics', action: { type: 'menu' } },
          ],
        });
        return;
      }
      setIsThinking(true);
      try {
        const text = await LIVE_INTENTS[faq.liveIntent]();
        pushBot(text, { chips: [{ label: '⬅ Back to topics', action: { type: 'menu' } }] });
      } catch {
        pushBot("Sorry, I couldn't fetch that right now. Please try again in a moment, or contact us directly.", {
          chips: [{ label: '⬅ Back to topics', action: { type: 'menu' } }],
        });
      } finally {
        setIsThinking(false);
      }
      return;
    }
    const relatedService = FAQ_SERVICE_MAP.get(faq.id);
    pushBot(faq.answer, {
      chips: [
        ...(relatedService
          ? [{ label: `Book ${relatedService.title}`, action: { type: 'book-service', title: relatedService.title } }]
          : []),
        { label: '⬅ Back to topics', action: { type: 'menu' } },
      ],
    });
  }

  async function logUnanswered(question) {
    try {
      await fetch(`${API_BASE}/unanswered`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, page: window.location.pathname }),
      });
    } catch {
      // Silent — logging the miss shouldn't block the fallback message.
    }
  }

  function handleChip(action) {
    if (action.type === 'category') {
      showCategory(action.id);
    } else if (action.type === 'menu') {
      showMenu();
    } else if (action.type === 'login') {
      onNavigate('login');
    } else if (action.type === 'faq') {
      const faq = FAQS.find((f) => f.id === action.id);
      setMessages((m) => [...m, makeUserMsg(faq.question)]);
      answerFaq(faq);
    } else if (action.type === 'goto') {
      setIsOpen(false);
      onNavigate(action.page, action.id);
    } else if (action.type === 'book-service') {
      setIsOpen(false);
      onBookService(action.title);
    }
  }

  // Describing a need ("my pet needs a daycare for 2 days") matches a real
  // service/product instead of getting a generic FAQ answer. Services get
  // clear steps + a one-tap link straight into booking with that service
  // pre-selected; products get added to the real cart right away with a
  // link to checkout — no extra round trip through the AI fallback.
  function answerCatalogMatch(match) {
    if (match.type === 'service') {
      const s = match.item;
      pushBot(
        `${s.tagline || s.description}\n\nHere's how to book it:\n1. Tap "Book ${s.title}" below\n2. Pick an available date & time\n3. Fill in your and your pet's details and confirm`,
        {
          chips: [
            { label: `Book ${s.title}`, action: { type: 'book-service', title: s.title } },
            { label: 'View details', action: { type: 'goto', page: 'services', id: s.id } },
            { label: '⬅ Back to topics', action: { type: 'menu' } },
          ],
        }
      );
    } else {
      const p = match.item;
      addToCart(p.id);
      pushBot(`Added ${p.name} to your cart — Rs. ${p.price}. Ready to check out?`, {
        chips: [
          { label: 'Go to Checkout', action: { type: 'goto', page: 'cart' } },
          { label: `View ${p.name}`, action: { type: 'goto', page: 'shop', id: p.id } },
          { label: '⬅ Back to topics', action: { type: 'menu' } },
        ],
      });
    }
  }

  async function askAI(text) {
    const res = await fetch(`${API_BASE}/ask`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    if (!res.ok) throw new Error('AI request failed');
    const data = await res.json();
    return data.answer;
  }

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages((m) => [...m, makeUserMsg(text)]);

    const smallTalk = matchSmallTalk(text);
    if (smallTalk) {
      const reply = smallTalk.replies[Math.floor(Math.random() * smallTalk.replies.length)];
      pushBot(reply, smallTalk.showTopics
        ? { chips: CATEGORIES.map((c) => ({ label: c.label, action: { type: 'category', id: c.id } })) }
        : undefined);
      return;
    }

    const match = matchFAQ(text);
    if (match) {
      await answerFaq(match);
      return;
    }

    const catalogMatch = matchCatalog(text, productKeywords);
    if (catalogMatch) {
      answerCatalogMatch(catalogMatch);
      return;
    }

    logUnanswered(text);
    setIsThinking(true);
    try {
      const answer = await askAI(text);
      pushBot(answer, { chips: [{ label: '⬅ Back to topics', action: { type: 'menu' } }] });
    } catch {
      pushBot(
        "I couldn't find an answer to that. I've passed your question on to our team — for anything urgent, reach us directly.",
        {
          chips: [
            { label: `Call ${PHONE}`, action: { type: 'noop' } },
            { label: `Email ${EMAIL}`, action: { type: 'noop' } },
            { label: '⬅ Back to topics', action: { type: 'menu' } },
          ],
        }
      );
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <div ref={containerRef} className={`vc-chatbot${isOpen ? ' vc-chatbot-open' : ''}`}>
      {isOpen && (
        <div className="vc-chatbot-panel">
          <div className="vc-chatbot-header">
            <div className="vc-chatbot-header-title">
              <span className="vc-chatbot-avatar">
                <img src={chatbotIcon} alt="" className="vc-chatbot-avatar-icon" />
              </span>
              <div>
                <div className="vc-chatbot-name">VinuCare Assistant</div>
                <div className="vc-chatbot-status">Here to help</div>
              </div>
            </div>
            <button className="vc-chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
              ✕
            </button>
          </div>

          <div className="vc-chatbot-body" ref={bodyRef}>
            {messages.map((m) => (
              <div key={m.id} className={`vc-chatbot-row vc-chatbot-row-${m.from}`}>
                <div className={`vc-chatbot-bubble vc-chatbot-bubble-${m.from}`}>
                  {m.text.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
                {m.chips && (
                  <div className="vc-chatbot-chips">
                    {m.chips.map((chip, i) => (
                      <button key={i} className="vc-chatbot-chip" onClick={() => handleChip(chip.action)}>
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isThinking && (
              <div className="vc-chatbot-row vc-chatbot-row-bot">
                <div className="vc-chatbot-bubble vc-chatbot-bubble-bot vc-chatbot-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          <form className="vc-chatbot-input-row" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="vc-chatbot-input"
            />
            <button type="submit" className="vc-chatbot-send" aria-label="Send">
              ➤
            </button>
          </form>
        </div>
      )}

      <button
        className="vc-chatbot-fab"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '✕' : <img src={chatbotIcon} alt="" className="vc-chatbot-fab-icon" />}
      </button>
    </div>
  );
}