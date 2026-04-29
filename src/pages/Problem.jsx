import { useState } from 'react';
import Navbar from '../components/Navbar';
import VerdictPanel from '../components/VerdictPanel';

const code = `def twoSum(nums, target):\n    # store seen values with index\n    seen = {}\n\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n\n    return []`;

export default function Problem() {
  const [tab, setTab] = useState('Description');

  return (
    <>
      <Navbar />
      <main className="problem-layout">
        <section className="left-panel">
          <div className="row-between">
            <h2><span className="muted">#1 ·</span> Two Sum</h2>
            <span className="pill amber">+75 XP</span>
          </div>
          <div className="row gap-8 mt-12">
            <span className="difficulty easy">Easy</span>
            <span className="tag">Array</span>
            <span className="tag">Hash Map</span>
          </div>

          <div className="tabs mt-16">
            {['Description', 'Solutions', 'Submissions'].map((t) => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>

          <article className="card mt-16">
            <p>Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.</p>
            <h4 className="mt-16">Example 1:</h4>
            <pre className="code-block">Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] = 2 + 7 = 9</pre>
            <h4>Constraints:</h4>
            <ul>
              <li>2 &lt;= nums.length &lt;= 10^4</li>
              <li>-10^9 &lt;= nums[i] &lt;= 10^9</li>
              <li>Only one valid answer exists.</li>
            </ul>
          </article>
        </section>

        <section className="right-panel">
          <div className="editor-top">
            <select className="input select"><option>Python</option></select>
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
              <button className="btn success">Submit</button>
            </div>
          </div>

          <div className="mt-16"><VerdictPanel /></div>
        </section>
      </main>
    </>
  );
}
