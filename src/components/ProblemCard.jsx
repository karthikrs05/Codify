import { Link } from 'react-router-dom';

export default function ProblemCard({ problem, delay = 0 }) {
  return (
    <article className="card problem-card" style={{ animationDelay: `${delay}ms` }}>
      <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
      <h3>{problem.title}</h3>
      <div className="tag-row">
        {problem.tags.map((tag) => (
          <span className="tag" key={tag}>{tag}</span>
        ))}
      </div>
      <div className="card-foot">
        <span className="xp mono">+{problem.xp} XP</span>
        <Link to="/problem/1" className="text-link">Continue →</Link>
      </div>
    </article>
  );
}
