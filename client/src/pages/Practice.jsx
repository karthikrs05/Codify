import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const AVAILABLE_TOPICS = [
  'Arrays', 'Strings', 'Hash Maps', 'Two Pointers', 'Sliding Window',
  'Linked Lists', 'Stacks & Queues', 'Trees', 'Graphs', 'Dynamic Programming'
];

const AVAILABLE_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

function getSlotIcon(slot) {
  if (slot.type === 'boss') return '👹';
  if (slot.type === 'optional') return '⭐';
  return `${slot.slotNumber}`;
}

function getSlotStatusIcon(status) {
  switch (status) {
    case 'completed': return '✓';
    case 'skipped': return '⏭';
    case 'unlocked': return '';
    default: return '🔒';
  }
}

function getSlotClass(status, type, isCurrent) {
  let base = 'roadmap-slot';
  if (status === 'completed') return `${base} completed`;
  if (status === 'skipped') return `${base} skipped`;
  if (status === 'unlocked') {
    if (type === 'boss') return `${base} boss-unlocked`;
    if (isCurrent) return `${base} current`;
    return `${base} unlocked`;
  }
  return `${base} locked`;
}

export default function Practice() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [needsAssessment, setNeedsAssessment] = useState(false);
  const [showHint, setShowHint] = useState(null);

  const [mode, setMode] = useState('roadmap');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Easy');
  const [roadmap, setRoadmap] = useState(null);
  const [currentSlot, setCurrentSlot] = useState(null);
  const [showingQuestion, setShowingQuestion] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [currentTopicData, setCurrentTopicData] = useState(null);

  const loadRoadmap = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/learning/roadmap', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRoadmap(data);
        setSelectedTopic(data.currentTopic);
        setNeedsAssessment(false);
      } else if (res.status === 400) {
        const data = await res.json();
        if (data.needsAssessment) {
          setNeedsAssessment(true);
        }
      }
    } catch (err) {
      console.error('Load roadmap error:', err);
    }
    setLoading(false);
    setInitialLoadDone(true);
  }, [token]);

  useEffect(() => {
    if (token && !initialLoadDone && mode === 'roadmap') {
      loadRoadmap();
    }
  }, [token, initialLoadDone, mode, loadRoadmap]);

  useEffect(() => {
    if (roadmap && selectedTopic) {
      const topicData = roadmap.roadmap?.find(r => r.topic === selectedTopic);
      setCurrentTopicData(topicData);
    }
  }, [roadmap, selectedTopic]);

  const loadQuestion = useCallback(async (topic = null, difficulty = null, slotNum = null) => {
    setLoading(true);
    setError('');
    setTestResults(null);
    setVerdict(null);
    setShowingQuestion(true);

    try {
      let url = '/api/learning/next-question';
      const isFreeModeCall = topic && mode === 'free';
      const isSlotCall = slotNum && mode === 'roadmap';

      if (isFreeModeCall) {
        url += `?topic=${encodeURIComponent(topic)}`;
        if (difficulty) {
          url += `&difficulty=${encodeURIComponent(difficulty)}`;
        }
      } else if (isSlotCall) {
        url += `?slot=${slotNum}`;
        if (selectedTopic) {
          url += `&topic=${encodeURIComponent(selectedTopic)}`;
        }
      }

      console.log('Calling:', url);

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text || 'Invalid response' };
      }

      if (res.ok) {
        if (data.question) {
          setQuestion(data.question);
          const starterCode = data.question?.starterCode;
          if (starterCode && typeof starterCode === 'object') {
            setCode(starterCode[language] || starterCode.python || '');
          } else if (starterCode) {
            setCode(starterCode);
          } else {
            setCode('');
          }
          setCurrentSlot(data.slotNumber);
          setNeedsAssessment(false);
        } else {
          setError('No question received. Check server logs.');
        }
      } else if (data.needsAssessment) {
        setNeedsAssessment(true);
      } else {
        setError(data.error || data.details || 'Failed to load question');
      }
    } catch (err) {
      console.error('Load question error:', err);
      setError(`Network error: ${err.message}. Check server is running.`);
    }
    setLoading(false);
  }, [token, language, mode, selectedTopic]);

  function handleTopicClick(topic) {
    setSelectedTopic(topic);
    setShowingQuestion(false);
    setQuestion(null);
    setCurrentSlot(null);
  }

  function handleSlotClick(slot) {
    if (slot.status === 'locked') return;
    loadQuestion(selectedTopic, null, slot.slotNumber);
  }

  async function handleSkipSlot() {
    if (!currentSlot) return;
    try {
      const res = await fetch('/api/learning/skip-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slotNumber: currentSlot,
          topic: selectedTopic,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (currentTopicData) {
          currentTopicData.questions = data.questions;
        }
        setShowingQuestion(false);
        setQuestion(null);
        loadRoadmap();
      }
    } catch (err) {
      console.error('Skip error:', err);
    }
  }

  async function handleRun() {
    if (!question) return;
    setRunning(true);
    setTestResults(null);
    setError('');

    const testCases = question.testCases?.slice(0, 3) || [];

    try {
      const res = await fetch('/api/learning/submit-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question, code, language }),
      });
      const data = await res.json();

      setTestResults({
        passed: data.passedTestCases || 0,
        total: data.totalTestCases || testCases.length,
        results: testCases.map((tc, i) => ({
          input: typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input),
          expected: typeof tc.expected === 'string' ? tc.expected : JSON.stringify(tc.expected),
          actual: data.failedTestCase?.actual || (i < (data.passedTestCases || 0) ? '✓' : '?'),
          pass: i < (data.passedTestCases || 0),
        })),
      });
    } catch (err) {
      setError('Failed to run code. Check server.');
    }
    setRunning(false);
  }

  async function handleSubmit() {
    if (!question) return;
    setSubmitting(true);
    setTestResults(null);
    setVerdict(null);
    setError('');

    try {
      const res = await fetch('/api/learning/submit-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question,
          code,
          language,
          slotNumber: currentSlot,
          topic: selectedTopic,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setVerdict(data);
        if (data.passed) {
          setTestResults({
            passed: data.passedTestCases,
            total: data.totalTestCases,
            results: [],
          });
          if (data.questions && currentTopicData) {
            currentTopicData.questions = data.questions;
          }
        } else {
          setTestResults({
            passed: data.passedTestCases,
            total: data.totalTestCases,
            failed: data.failedTestCase,
            results: [],
          });
        }
      } else {
        setError(data.error || 'Failed to submit');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setSubmitting(false);
  }

  function handleReset() {
    if (question?.starterCode) {
      const starterCode = question.starterCode;
      if (typeof starterCode === 'object') {
        setCode(starterCode[language] || starterCode.python || '');
      } else {
        setCode(starterCode);
      }
    }
    setTestResults(null);
    setVerdict(null);
    setError('');
  }

  function handleBackToRoadmap() {
    setShowingQuestion(false);
    setQuestion(null);
    setCurrentSlot(null);
    setTestResults(null);
    setVerdict(null);
    setError('');
    loadRoadmap();
  }

  if (loading && !initialLoadDone) {
    return (
      <>
        <Navbar />
        <div className="loading-page">Loading practice...</div>
      </>
    );
  }

  if (needsAssessment) {
    return (
      <>
        <Navbar />
        <div className="page" style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center' }}>
          <div className="card" style={{ padding: 40 }}>
            <h2 style={{ marginBottom: 16 }}>Choose Your Path</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
              Complete the skill assessment for a personalized roadmap, or jump straight into free practice.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/assessment" className="btn-primary">Start Assessment</Link>
              <button
                className="btn-ghost"
                onClick={() => {
                  setMode('free');
                  setNeedsAssessment(false);
                  setInitialLoadDone(true);
                }}
              >
                Free Practice
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (showingQuestion && question) {
    const isOptional = question.slotNumber === 5 && !question.isBossTask;
    const isBoss = question.isBossTask;

    return (
      <>
        <Navbar />
        <div className="page" style={{ maxWidth: '100%', padding: '20px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  className="btn-ghost"
                  onClick={handleBackToRoadmap}
                  style={{ padding: '6px 12px', fontSize: 13 }}
                >
                  ← Back to Roadmap
                </button>
                {isBoss && (
                  <span className="tag" style={{ background: 'rgba(245,158,11,0.2)', color: 'var(--amber)', fontWeight: 600 }}>
                    👹 BOSS TASK
                  </span>
                )}
                {isOptional && !isBoss && (
                  <span className="tag" style={{ background: 'rgba(59,130,246,0.15)', color: '#93C5FD' }}>
                    ⭐ Optional (Skip Available)
                  </span>
                )}
              </div>
              {question && (
                <div className="meta">
                  <span className={`badge-${question.difficulty?.toLowerCase() || 'easy'}`}>{question.difficulty || 'Easy'}</span>
                  {question.topic && <span className="tag">{question.topic}</span>}
                  <span className="mono" style={{ color: 'var(--purple-light)', marginLeft: 8 }}>
                    +{question.xpReward || 100} XP
                  </span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div style={{ maxWidth: 1200, margin: '0 auto 16px', padding: '0 20px' }}>
              <div style={{ color: 'var(--red)', padding: 12, background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>
                {error}
              </div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ color: 'var(--muted)', fontSize: 16 }}>Generating your problem... AI is thinking...</div>
            </div>
          )}

          {question && !loading && (
            <div className="problem-layout" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
              <div className="problem-left">
                <h1 style={{ fontSize: 22 }}>{question.title}</h1>

                <h3>Description</h3>
                <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                  {question.description}
                </p>

                {question.testCases?.length > 0 && (
                  <>
                    <h3>Examples</h3>
                    {question.testCases.slice(0, 2).map((tc, i) => (
                      <div className="example" key={i}>
                        <div><strong>Input:</strong> {typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input)}</div>
                        <div><strong>Output:</strong> {typeof tc.expected === 'string' ? tc.expected : JSON.stringify(tc.expected)}</div>
                      </div>
                    ))}
                  </>
                )}

                {question.hints && question.hints.length > 0 && (
                  <>
                    <h3>Hints</h3>
                    {question.hints.map((hint, i) => (
                      <button
                        key={i}
                        onClick={() => setShowHint(showHint === i ? null : i)}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: 12,
                          marginBottom: 8,
                          background: 'var(--bg-card)',
                          border: 'none',
                          borderRadius: 8,
                          color: showHint === i ? 'var(--purple-light)' : 'var(--muted)',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontSize: 13,
                        }}
                      >
                        💡 Hint {i + 1}: {showHint === i ? hint : 'Click to reveal...'}
                      </button>
                    ))}
                  </>
                )}
              </div>

              <div className="problem-right">
                <div className="editor-top">
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                  </select>
                  <button className="btn-ghost" onClick={handleReset} style={{ padding: '6px 12px', fontSize: 12 }}>Reset</button>
                </div>

                <textarea
                  className="code-editor"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                />

                <div className="editor-buttons">
                  <button className="btn-ghost" onClick={handleRun} disabled={running || submitting}>
                    {running ? 'Running...' : 'Run Code'}
                  </button>
                  <button className="btn-primary" onClick={handleSubmit} disabled={running || submitting}>
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>

                {isOptional && !verdict?.passed && (
                  <button
                    className="btn-ghost"
                    onClick={handleSkipSlot}
                    style={{ width: '100%', borderStyle: 'dashed', color: 'var(--dim)', fontSize: 12 }}
                  >
                    ⏭ Skip this optional question (no XP)
                  </button>
                )}

                {testResults && (
                  <div className="test-results">
                    <p style={{ fontWeight: 600, marginBottom: 8 }}>
                      Test Results: {testResults.passed}/{testResults.total} passed
                    </p>
                    {testResults.results?.length > 0 && testResults.results.map((t, i) => (
                      <div key={i} style={{ fontSize: 13, marginBottom: 6 }}>
                        <span className={t.pass ? 'test-pass' : 'test-fail'}>{t.pass ? '✅' : '❌'}</span>
                        <span style={{ color: 'var(--muted)', marginLeft: 8 }}>Input: {t.input}</span>
                        <span style={{ marginLeft: 8, color: t.pass ? 'var(--green)' : 'var(--red)' }}>
                          → {t.actual}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {verdict && (
                  <div className={`verdict-box ${verdict.passed ? 'verdict-ac' : 'verdict-wa'}`}>
                    {verdict.passed ? (
                      <>
                        ✅ {verdict.verdict} — +{verdict.xpEarned} XP
                        {verdict.isBossTask && verdict.bossTaskCompleted && (
                          <div style={{ marginTop: 8, fontSize: 14 }}>
                            🏆 Boss Task Defeated!
                          </div>
                        )}
                      </>
                    ) : (
                      `❌ ${verdict.verdict} (${verdict.passedTestCases}/${verdict.totalTestCases} tests)`
                    )}
                  </div>
                )}

                {verdict && verdict.feedback && (
                  <div className="card" style={{ marginTop: 16, background: 'rgba(124,58,237,0.05)', borderLeft: '3px solid var(--purple)' }}>
                    <h4 style={{ marginBottom: 8 }}>Feedback</h4>
                    <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {verdict.feedback}
                    </p>
                    {verdict.suggestions && verdict.suggestions.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <h4 style={{ marginBottom: 8, fontSize: 13 }}>Suggestions:</h4>
                        <ul style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.8, paddingLeft: 20 }}>
                          {verdict.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {verdict?.passed && (
                  <button
                    className="btn-primary"
                    onClick={handleBackToRoadmap}
                    style={{ width: '100%', marginTop: 16, background: 'var(--green)' }}
                  >
                    ← Back to Roadmap
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page" style={{ maxWidth: 1200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 8, padding: 4 }}>
            <button
              onClick={() => { setMode('roadmap'); setShowingQuestion(false); loadRoadmap(); }}
              style={{
                padding: '8px 20px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: 600,
                background: mode === 'roadmap' ? 'var(--purple)' : 'transparent',
                color: mode === 'roadmap' ? 'white' : 'var(--muted)',
                transition: 'all 0.2s',
              }}
            >
              🗺️ My Roadmap
            </button>
            <button
              onClick={() => { setMode('free'); setShowingQuestion(false); }}
              style={{
                padding: '8px 20px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: 600,
                background: mode === 'free' ? 'var(--purple)' : 'transparent',
                color: mode === 'free' ? 'white' : 'var(--muted)',
                transition: 'all 0.2s',
              }}
            >
              🎯 Free Practice
            </button>
          </div>
        </div>

        {error && (
          <div style={{ color: 'var(--red)', marginBottom: 16, padding: 12, background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>
            {error}
          </div>
        )}

        {mode === 'free' ? (
          <div>
            <div className="card" style={{ marginBottom: 24, padding: 24 }}>
              <h3 style={{ marginBottom: 16 }}>Choose what to practice</h3>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 12, color: 'var(--muted)' }}>Topic</label>
                  <select
                    value={selectedTopic || ''}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    style={{ width: 180 }}
                  >
                    <option value="">Select topic...</option>
                    {AVAILABLE_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 12, color: 'var(--muted)' }}>Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    style={{ width: 140 }}
                  >
                    {AVAILABLE_DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div style={{ alignSelf: 'flex-end' }}>
                  <button
                    className="btn-primary"
                    onClick={() => loadQuestion(selectedTopic, selectedDifficulty)}
                    disabled={!selectedTopic || loading}
                  >
                    {loading ? 'Generating...' : 'Generate Problem'}
                  </button>
                </div>
              </div>
            </div>

            {showingQuestion && question && (
              <div className="problem-layout" style={{ maxWidth: '100%', height: 'auto', minHeight: 500 }}>
                <div className="problem-left">
                  <h1 style={{ fontSize: 22 }}>{question.title}</h1>
                  <h3>Description</h3>
                  <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                    {question.description}
                  </p>
                </div>
                <div className="problem-right">
                  <div className="editor-top">
                    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                    </select>
                    <button className="btn-ghost" onClick={handleReset} style={{ padding: '6px 12px', fontSize: 12 }}>Reset</button>
                  </div>
                  <textarea className="code-editor" value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} />
                  <div className="editor-buttons">
                    <button className="btn-ghost" onClick={handleRun} disabled={running}>{running ? 'Running...' : 'Run Code'}</button>
                    <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
                  </div>
                  {testResults && (
                    <div className="test-results">
                      <p style={{ fontWeight: 600 }}>Test Results: {testResults.passed}/{testResults.total}</p>
                    </div>
                  )}
                  {verdict && (
                    <div className={`verdict-box ${verdict.passed ? 'verdict-ac' : 'verdict-wa'}`}>
                      {verdict.passed ? `✅ ${verdict.verdict} — +${verdict.xpEarned} XP` : `❌ ${verdict.verdict}`}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {loading && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Loading your roadmap...</div>
            )}

            {!loading && roadmap && (
              <div>
                <div className="card" style={{ marginBottom: 24, padding: 20 }}>
                  <h3 style={{ marginBottom: 16 }}>📚 Your Topics</h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {roadmap.roadmap?.map((item, i) => (
                      <button
                        key={item.topic}
                        onClick={() => handleTopicClick(item.topic)}
                        style={{
                          padding: '10px 20px',
                          borderRadius: 8,
                          border: selectedTopic === item.topic ? '2px solid var(--purple)' : '1px solid var(--border)',
                          background: selectedTopic === item.topic ? 'rgba(124,58,237,0.15)' : 'var(--bg-card)',
                          cursor: item.isLocked ? 'not-allowed' : 'pointer',
                          fontFamily: 'inherit',
                          fontSize: 14,
                          fontWeight: 600,
                          color: selectedTopic === item.topic ? 'var(--purple-light)' : (item.isLocked ? 'var(--dim)' : 'var(--text)'),
                          opacity: item.isLocked ? 0.5 : 1,
                          transition: 'all 0.2s',
                        }}
                        disabled={item.isLocked}
                      >
                        {item.isCompleted ? '✓ ' : ''}
                        {item.topic}
                        {item.isCurrent && ' ◀'}
                        <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>
                          {item.progress?.completed}/{item.progress?.total}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {currentTopicData && (
                  <div>
                    <h2 style={{ marginBottom: 4 }}>{currentTopicData.topic}</h2>
                    <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: 14 }}>
                      Complete Questions 1-4 to unlock the Boss Task. Question 5 is optional.
                    </p>

                    <div className="card" style={{ padding: 32 }}>
                      <div className="roadmap-grid">
                        {currentTopicData.questions?.map((slot, i) => {
                          const isCurrent = currentTopicData.questions.findIndex(
                            s => s.status === 'unlocked' && !currentTopicData.questions.some(
                              (s2, j) => j < i && s2.status === 'unlocked'
                            )
                          ) === i;

                          return (
                            <button
                              key={slot.slotNumber}
                              onClick={() => handleSlotClick(slot)}
                              disabled={slot.status === 'locked'}
                              className={getSlotClass(slot.status, slot.type, isCurrent)}
                            >
                              <div className="slot-icon">{getSlotIcon(slot)}</div>
                              <div className="slot-num">Q{slot.slotNumber}</div>
                              <div className="slot-status">{getSlotStatusIcon(slot.status)}</div>
                              {slot.type === 'optional' && (
                                <div className="slot-badge">Optional</div>
                              )}
                              {slot.type === 'boss' && (
                                <div className="slot-badge boss">BOSS</div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div style={{ display: 'flex', gap: 24, marginTop: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 12, height: 12, borderRadius: 4, background: 'var(--border)' }}></div>
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Locked</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 12, height: 12, borderRadius: 4, background: 'var(--purple)' }}></div>
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Available</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 12, height: 12, borderRadius: 4, background: 'var(--green)' }}></div>
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Completed</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 12, height: 12, borderRadius: 4, background: 'var(--amber)' }}></div>
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Skipped</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
