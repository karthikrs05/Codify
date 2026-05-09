import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import VerdictPanel from '../components/VerdictPanel';
import { useAuth } from '../auth/AuthProvider';
import { apiFetch } from '../auth/api';
import { useNavigate } from 'react-router-dom';

const code = `def twoSum(nums, target):\n    # store seen values with index\n    seen = {}\n\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n\n    return []`;

export default function Problem() {
  const [tab, setTab] = useState('Description');
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState(null);
  const [language, setLanguage] = useState('Python');
  const [submitting, setSubmitting] = useState(false);
  const [lastVerdict, setLastVerdict] = useState(null);

  const problem = payload?.problem;

  async function load() {
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/problems/next', { token });
      setPayload(res);
    } catch (e) {
      setError(e?.data?.error || 'Failed to load problem');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const meta = useMemo(() => {
    if (!problem) return null;
    return {
      num: problem.kind === 'fixed' ? '#Fixed' : problem.kind === 'boss' ? '#Boss' : '#Adaptive',
      xp: problem.xp || 0,
      difficulty: (problem.difficulty || 'Medium').toLowerCase()
    };
  }, [problem]);

  async function submit(verdict) {
    if (!problem) return;
    setSubmitting(true);
    setLastVerdict(null);
    try {
      await apiFetch('/api/submissions', {
        token,
        method: 'POST',
        body: JSON.stringify({ problemId: problem.id, verdict, language })
      });
      setLastVerdict(verdict);
      await load();
    } catch (e) {
      setError(e?.data?.error || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="problem-layout">
        <section className="left-panel">
          {loading ? <p className="muted">Loading problem…</p> : null}
          {error ? (
            <div>
              <p className="muted red">{error}</p>
              <div className="btn-row">
                <button className="btn ghost" onClick={load}>Retry</button>
                <button className="btn ghost" onClick={() => navigate('/dashboard')}>Back</button>
              </div>
            </div>
          ) : null}

          {!loading && problem ? (
            <>
              <div className="row-between">
                <h2><span className="muted">{meta?.num} ·</span> {problem.title}</h2>
                <span className="pill amber">+{meta?.xp} XP</span>
              </div>
              <div className="row gap-8 mt-12">
                <span className={`difficulty ${meta?.difficulty}`}>{problem.difficulty}</span>
                {(problem.tags || []).slice(0, 5).map((t) => <span className="tag" key={t}>{t}</span>)}
              </div>
            </>
          ) : null}

          <div className="tabs mt-16">
            {['Description', 'Solutions', 'Submissions'].map((t) => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>

          <article className="card mt-16">
            {!problem ? <p className="muted">No problem assigned yet.</p> : null}
            {problem?.prompt ? <p>{problem.prompt}</p> : <p className="muted">Prompt will appear here.</p>}
            {payload?.progression?.roadmap?.length ? (
              <>
                <h4 className="mt-16">Roadmap</h4>
                <div className="topic-list mt-12">
                  {payload.progression.roadmap.slice(0, 6).map((t) => (
                    <div className="topic-row" key={t.name}>
                      <span>{t.name}</span>
                      <span className="mono muted">{t.pct}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </article>
        </section>

        <section className="right-panel">
          <div className="editor-top">
            <select className="input select" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option>Python</option>
              <option>JavaScript</option>
              <option>Java</option>
              <option>C++</option>
              <option>Go</option>
            </select>
            <div className="row gap-12"><button className="text-btn">Reset</button><button className="text-btn">Fullscreen</button></div>
          </div>

          <div className="editor-box mt-12">
            <div className="line-numbers">1\n2\n3\n4\n5\n6\n7\n8\n9\n10</div>
            <pre className="code-text">{code}</pre>
          </div>

          <div className="card mt-16">
            <div className="tabs">
              <button className="tab-btn active">Test Cases</button>
              <button className="tab-btn">Results</button>
            </div>
            <div className="test-row">Input: nums=[2,7,11,15], target=9 | Expected: [0,1]</div>
            <div className="test-row">Input: nums=[3,2,4], target=6 | Expected: [1,2]</div>
            <div className="row-between mt-16">
              <button className="btn ghost">Run Code</button>
              <div className="row gap-8">
                <button className="btn ghost" disabled={submitting || !problem} onClick={() => submit('WA')}>Submit WA</button>
                <button className="btn success" disabled={submitting || !problem} onClick={() => submit('AC')}>
                  {submitting ? 'Submitting…' : 'Submit AC'}
                </button>
              </div>
            </div>
            {lastVerdict ? <p className={`muted mt-12 ${lastVerdict === 'AC' ? 'green' : 'red'}`}>Last verdict: {lastVerdict}</p> : null}
          </div>

          <div className="mt-16"><VerdictPanel /></div>
        </section>
      </main>
    </>
  );
}
