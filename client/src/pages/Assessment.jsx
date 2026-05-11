import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Assessment() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [language, setLanguage] = useState('python');

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/assessment/status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.completed) {
          setCompleted(true);
          setLoading(false);
          return;
        }
        await startAssessment();
      } catch (err) {
        setError('Failed to check assessment status');
        setLoading(false);
      }
    }

    if (token) checkStatus();
  }, [token]);

  async function startAssessment() {
    try {
      const res = await fetch('/api/assessment/start', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        const initialSubmissions = {};
        data.questions.forEach(q => {
          initialSubmissions[q.id] = {
            code: q.starterCode?.python || q.starterCode || '',
            language: 'python'
          };
        });
        setSubmissions(initialSubmissions);
      }
    } catch (err) {
      setError('Failed to start assessment. Check server is running and API keys are configured.');
    }
    setLoading(false);
  }

  function handleCodeChange(value) {
    if (questions.length === 0) return;
    const id = questions[currentIndex].id;
    setSubmissions(prev => ({
      ...prev,
      [id]: { ...prev[id], code: value, language }
    }));
  }

  async function handleSubmitAssessment() {
    setSubmitting(true);
    setError('');

    const submissionArray = questions.map(q => ({
      questionId: q.id,
      topic: q.topic,
      title: q.title,
      code: submissions[q.id]?.code || '',
      language: submissions[q.id]?.language || 'python',
      testCases: q.testCases,
    }));

    try {
      const res = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ submissions: submissionArray }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        setCompleted(true);
      } else {
        setError(data.error || 'Failed to submit assessment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setSubmitting(false);
  }

  const currentQuestion = questions[currentIndex];
  const currentSubmission = currentQuestion ? submissions[currentQuestion.id] : null;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-page">Loading assessment...</div>
      </>
    );
  }

  if (completed && result) {
    return (
      <>
        <Navbar />
        <div className="page" style={{ maxWidth: 700, margin: '40px auto' }}>
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <h1 style={{ marginBottom: 8 }}>Assessment Complete!</h1>
            <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Your personalized learning path is ready.</p>

            <div className="card" style={{ background: 'rgba(124,58,237,0.1)', borderLeft: '4px solid var(--purple)', marginBottom: 24 }}>
              <h3 style={{ marginBottom: 12 }}>Your Level: {result.evaluation.level}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>{result.evaluation.feedback}</p>
            </div>

            {result.evaluation.strengths?.length > 0 && (
              <div style={{ marginBottom: 20, textAlign: 'left' }}>
                <h4 style={{ marginBottom: 8, color: 'var(--green)' }}>Strengths:</h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {result.evaluation.strengths.map((s, i) => (
                    <span key={i} className="tag" style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--green)' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {result.evaluation.weaknesses?.length > 0 && (
              <div style={{ marginBottom: 24, textAlign: 'left' }}>
                <h4 style={{ marginBottom: 8, color: 'var(--amber)' }}>Areas to Focus:</h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {result.evaluation.weaknesses.map((w, i) => (
                    <span key={i} className="tag" style={{ background: 'rgba(245,158,11,0.2)', color: 'var(--amber)' }}>{w}</span>
                  ))}
                </div>
              </div>
            )}

            {result.roadmap?.length > 0 && (
              <div style={{ textAlign: 'left', marginBottom: 24 }}>
                <h4 style={{ marginBottom: 12 }}>Your Learning Roadmap:</h4>
                {result.roadmap.slice(0, 5).map((item, i) => (
                  <div key={i} className="card" style={{ marginBottom: 8, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14 }}>{i + 1}</span>
                    <div>
                      <h4 style={{ marginBottom: 2 }}>{item.topic}</h4>
                      <p style={{ fontSize: 13, color: 'var(--muted)' }}>{item.reason || `~${item.estimatedProblems} problems`}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ minWidth: 200 }}>
              Go to Dashboard →
            </button>
          </div>
        </div>
      </>
    );
  }

  if (completed) {
    return (
      <>
        <Navbar />
        <div className="page" style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center' }}>
          <div className="card" style={{ padding: 40 }}>
            <h2 style={{ marginBottom: 16 }}>Assessment Already Completed</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 24 }}>You've already completed the skill assessment.</p>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
          </div>
        </div>
      </>
    );
  }

  if (error && questions.length === 0) {
    return (
      <>
        <Navbar />
        <div className="page" style={{ maxWidth: 600, margin: '80px auto' }}>
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <h2 style={{ color: 'var(--red)', marginBottom: 16 }}>Setup Required</h2>
            <p style={{ marginBottom: 12, color: 'var(--muted)' }}>{error}</p>
            <div className="card" style={{ background: 'rgba(8,8,16,0.5)', textAlign: 'left', marginTop: 24 }}>
              <h4 style={{ marginBottom: 12 }}>To fix this:</h4>
              <ol style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 2 }}>
                <li>Get a free API key from <code style={{ color: 'var(--purple)' }}>console.groq.com</code></li>
                <li>Add it to your <code style={{ color: 'var(--purple)' }}>.env</code> file:</li>
              </ol>
              <pre style={{ background: 'var(--bg-card)', padding: 12, borderRadius: 8, marginTop: 12, fontSize: 13, overflow: 'auto' }}>GROQ_API_KEYS=gsk_your_key_here</pre>
              <ol start={3} style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 2, marginTop: 16 }}>
                <li>Restart the server</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page" style={{ maxWidth: 1000 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <h2>Skill Assessment</h2>
            <span className="mono" style={{ color: 'var(--muted)' }}>
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
          <div style={{ height: 4, background: 'var(--bg-card)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--purple)', width: `${((currentIndex + 1) / questions.length) * 100}%`, transition: 'width 0.3s' }} />
          </div>
        </div>

        {error && <div style={{ color: 'var(--red)', marginBottom: 16, padding: 12, background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>{error}</div>}

        {currentQuestion && (
          <div className="problem-layout">
            <div className="problem-left">
              <h2>{currentQuestion.title}</h2>
              <div className="meta">
                <span className={`badge-${currentQuestion.difficulty.toLowerCase()}`}>{currentQuestion.difficulty}</span>
                <span className="tag">{currentQuestion.topic}</span>
              </div>

              <h3>Description</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{currentQuestion.description}</p>

              {currentQuestion.testCases?.length > 0 && (
                <>
                  <h3>Examples</h3>
                  {currentQuestion.testCases.slice(0, 2).map((tc, i) => (
                    <div className="example" key={i}>
                      <div><strong>Input:</strong> {typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input)}</div>
                      <div><strong>Expected:</strong> {typeof tc.expected === 'string' ? tc.expected : JSON.stringify(tc.expected)}</div>
                    </div>
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
              </div>

              <textarea
                className="code-editor"
                value={currentSubmission?.code || ''}
                onChange={(e) => handleCodeChange(e.target.value)}
                spellCheck={false}
                placeholder="Write your solution here..."
              />

               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                 <button
                   className="btn-ghost"
                   onClick={() => {
                     const id = currentQuestion?.id;
                     if (id) {
                       setSubmissions(prev => ({
                         ...prev,
                         [id]: { ...prev[id], skipped: true, code: prev[id]?.code || '' }
                       }));
                     }
                     if (currentIndex < questions.length - 1) {
                       setCurrentIndex(currentIndex + 1);
                     }
                   }}
                   style={{ padding: '4px 10px', fontSize: 12, color: 'var(--dim)' }}
                 >
                   Skip this question →
                 </button>
               </div>

               <div className="editor-buttons" style={{ justifyContent: 'space-between' }}>
                 <button
                   className="btn-ghost"
                   onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                   disabled={currentIndex === 0}
                 >
                   ← Previous
                 </button>

                 <div style={{ display: 'flex', gap: 8 }}>
                   {currentIndex === questions.length - 1 ? (
                     <>
                       <button
                         className="btn-ghost"
                         onClick={async () => {
                           try {
                             const res = await fetch('/api/assessment/submit', {
                               method: 'POST',
                               headers: {
                                 'Content-Type': 'application/json',
                                 Authorization: `Bearer ${token}`,
                               },
                               body: JSON.stringify({
                                 isBeginnerSkip: true,
                                 submissions: []
                               }),
                             });
                             const data = await res.json();
                             if (res.ok) {
                               setResult(data);
                               setCompleted(true);
                             }
                           } catch (err) {
                             setError('Failed. Try answering at least one question.');
                           }
                         }}
                         style={{ fontSize: 12, padding: '8px 14px' }}
                       >
                         I'm a Beginner →
                       </button>
                       <button
                         className="btn-primary"
                         onClick={handleSubmitAssessment}
                         disabled={submitting}
                         style={{ background: 'var(--green)' }}
                       >
                         {submitting ? 'Evaluating...' : 'Submit ✓'}
                       </button>
                     </>
                   ) : (
                     <button
                       className="btn-primary"
                       onClick={() => setCurrentIndex(currentIndex + 1)}
                     >
                       Next →
                     </button>
                   )}
                 </div>
               </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 600,
                background: i === currentIndex ? 'var(--purple)' : (submissions[questions[i]?.id]?.code ? 'rgba(124,58,237,0.3)' : 'var(--bg-card)'),
                color: 'white',
                transition: 'all 0.2s',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
