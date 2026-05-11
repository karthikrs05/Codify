import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const TYPING_CODE = `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`;

export default function Landing() {
  const [displayedCode, setDisplayedCode] = useState('');
  const [codeIndex, setCodeIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (codeIndex < TYPING_CODE.length) {
      const timeout = setTimeout(() => {
        setDisplayedCode(prev => prev + TYPING_CODE[codeIndex]);
        setCodeIndex(codeIndex + 1);
      }, 40);
      return () => clearTimeout(timeout);
    }
  }, [codeIndex]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <>
      <Navbar />

      <div className="hero-gradient">
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="dot"></span>
              Powered by Llama 3.3 70B
            </div>
            <h1 className="hero-title">
              Master Coding with
              <br />
              <span className="hero-gradient-text">AI-Powered Learning</span>
            </h1>
            <p className="hero-subtitle">
              Personalized roadmaps, adaptive questions, and instant AI feedback.
              Level up your algorithms skills at your own pace.
            </p>
            <div className="hero-buttons">
              <Link to="/signup" className="hero-btn-primary">
                Get Started Free
                <span className="arrow">→</span>
              </Link>
              <Link to="/login" className="hero-btn-secondary">
                Sign In
              </Link>
            </div>
            <div className="hero-trust">
              <span className="trust-dot"></span>
              Free Forever • No Credit Card Required
            </div>
          </div>

           <div className="hero-code">
             <div className="code-window">
               <div className="code-header">
                 <div className="code-dots">
                   <span className="dot red"></span>
                   <span className="dot yellow"></span>
                   <span className="dot green"></span>
                 </div>
                 <span className="code-filename">solution.py</span>
               </div>
               <div className="code-body">
                 <pre>
                   <code>
                     {displayedCode}
                     <span className={`cursor ${showCursor ? 'visible' : ''}`}>|</span>
                   </code>
                 </pre>
               </div>
             </div>
           </div>
         </section>

         <div className="scroll-indicator" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
           <div className="scroll-arrow">↓</div>
           <span className="scroll-text">Scroll to explore</span>
         </div>
       </div>

      <section className="section-how">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three simple steps to coding mastery</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">📊</div>
            <h3>Take Assessment</h3>
            <p>Answer diagnostic questions. Our AI evaluates your current level across all key topics.</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">🗺️</div>
            <h3>Get Your Roadmap</h3>
            <p>Receive a personalized learning path. Focus on weaknesses first, then build on strengths.</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">🏆</div>
            <h3>Beat the Boss</h3>
            <p>Solve problems, earn XP, and defeat Boss Tasks to prove mastery and advance to the next topic.</p>
          </div>
        </div>
      </section>

      <section className="section-features">
        <div className="section-header">
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-subtitle">Built for focused, effective learning</p>
        </div>

        <div className="features-grid-2">
          <div className="feature-card-2">
            <div className="feature-icon-2" style={{ background: 'rgba(124,58,237,0.15)' }}>
              🤖
            </div>
            <div>
              <h3>AI Question Generation</h3>
              <p>Never run out of practice. Our AI generates unique, topic-specific problems tailored to your level.</p>
            </div>
          </div>

          <div className="feature-card-2">
            <div className="feature-icon-2" style={{ background: 'rgba(16,185,129,0.15)' }}>
              💬
            </div>
            <div>
              <h3>Instant AI Feedback</h3>
              <p>Submit code and get detailed evaluation: what went right, what could improve, and why.</p>
            </div>
          </div>

          <div className="feature-card-2">
            <div className="feature-icon-2" style={{ background: 'rgba(245,158,11,0.15)' }}>
              🔥
            </div>
            <div>
              <h3>Streak Tracking</h3>
              <p>Build consistency. Track your activity heatmap and keep your daily streak alive.</p>
            </div>
          </div>

          <div className="feature-card-2">
            <div className="feature-icon-2" style={{ background: 'rgba(239,68,68,0.15)' }}>
              👹
            </div>
            <div>
              <h3>Boss Task System</h3>
              <p>Prove your mastery. Beat challenging Boss Tasks to unlock the next topic in your roadmap.</p>
            </div>
          </div>

          <div className="feature-card-2">
            <div className="feature-icon-2" style={{ background: 'rgba(59,130,246,0.15)' }}>
              🎯
            </div>
            <div>
              <h3>Free Practice Mode</h3>
              <p>Want to explore? Choose any topic and difficulty level. Practice what you want, when you want.</p>
            </div>
          </div>

          <div className="feature-card-2">
            <div className="feature-icon-2" style={{ background: 'rgba(236,72,153,0.15)' }}>
              📈
            </div>
            <div>
              <h3>Progress Analytics</h3>
              <p>See your growth. Track mastery per topic, XP earned, problems solved, and more.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-cta">
        <div className="cta-card">
          <h2 className="cta-title">Ready to Level Up?</h2>
          <p className="cta-subtitle">
            Join thousands of developers learning smarter with AI-powered practice.
          </p>
          <Link to="/signup" className="cta-btn">
            Start Learning Free →
          </Link>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span style={{ color: 'var(--purple)' }}>// </span>CODIFY
          </div>
          <p className="footer-tagline">AI-Powered Coding Practice</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <p className="footer-copy">Built with Groq AI (Llama 3.3 70B)</p>
          <p className="footer-copy">Developed by Karthik, Sravan & Agraj</p>
          <p style={{ color: 'var(--dim)', fontSize: 12, marginTop: 8 }}>&copy; 2025 Codify Arena</p>
        </div>
      </footer>
    </>
  );
}
