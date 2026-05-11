import { useState } from 'react';
import Navbar from '../components/Navbar';
import { mockProblems } from '../data/mock';

const problem = mockProblems[0];

export default function Problem() {
  const [language, setLanguage] = useState('Python');
  const [code, setCode] = useState(problem.starterCode || '');
  const [testResults, setTestResults] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleRun() {
    setRunning(true);
    setVerdict(null);
    setTimeout(() => {
      setTestResults([
        { input: 'nums = [2,7,11,15], target = 9', expected: '[0,1]', actual: '[0,1]', pass: true },
        { input: 'nums = [3,2,4], target = 6', expected: '[1,2]', actual: '[1,2]', pass: true },
      ]);
      setRunning(false);
    }, 800);
  }

  function handleSubmit() {
    setSubmitting(true);
    setTestResults(null);
    setTimeout(() => {
      setVerdict({ status: 'AC', xp: problem.xp });
      setSubmitting(false);
    }, 1200);
  }

  function handleReset() {
    setCode(problem.starterCode || '');
    setTestResults(null);
    setVerdict(null);
  }

  return (
    <>
      <Navbar />
      <div className="problem-layout">
        <div className="problem-left">
          <h1>{problem.title}</h1>
          <div className="meta">
            <span className={`badge-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
            {problem.tags.map((t) => (<span className="tag" key={t} style={{ marginLeft: 4 }}>{t}</span>))}
            <span className="mono" style={{ color: 'var(--purple-light)', marginLeft: 'auto' }}>+{problem.xp} XP</span>
          </div>

          <h3>Description</h3>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>{problem.description}</p>

          {problem.examples && (
            <>
              <h3>Examples</h3>
              {problem.examples.map((ex, i) => (
                <div className="example" key={i}>
                  <div><strong>Input:</strong> {ex.input}</div>
                  <div><strong>Output:</strong> {ex.output}</div>
                  {ex.explanation && <div><strong>Explanation:</strong> {ex.explanation}</div>}
                </div>
              ))}
            </>
          )}

          {problem.constraints && (
            <>
              <h3>Constraints</h3>
              {problem.constraints.map((c, i) => (
                <p className="constraint" key={i}>• {c}</p>
              ))}
            </>
          )}
        </div>

        <div className="problem-right">
          <div className="editor-top">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option>Python</option>
              <option>C++</option>
              <option>Java</option>
            </select>
            <button className="btn-ghost" onClick={handleReset} style={{ padding: '6px 12px', fontSize: 12 }}>Reset</button>
          </div>

          <textarea
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
          />

          <div className="editor-buttons">
            <button className="btn-ghost" onClick={handleRun} disabled={running}>
              {running ? 'Running...' : 'Run Code'}
            </button>
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>

          {testResults && (
            <div className="test-results">
              <p style={{ fontWeight: 600, marginBottom: 8 }}>Test Results</p>
              {testResults.map((t, i) => (
                <div key={i} style={{ fontSize: 13, marginBottom: 6 }}>
                  <span className={t.pass ? 'test-pass' : 'test-fail'}>{t.pass ? '✅' : '❌'}</span>
                  <span style={{ color: 'var(--muted)', marginLeft: 8 }}>Input: {t.input}</span>
                  <span style={{ marginLeft: 8 }}>→ {t.actual}</span>
                </div>
              ))}
            </div>
          )}

          {verdict && (
            <div className={`verdict-box ${verdict.status === 'AC' ? 'verdict-ac' : 'verdict-wa'}`}>
              {verdict.status === 'AC' ? `✅ Accepted — +${verdict.xp} XP` : '❌ Wrong Answer'}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
