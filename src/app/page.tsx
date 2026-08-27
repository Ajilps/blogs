const posts = [
  {
    category: "Product",
    title: "Build the smallest thing that teaches you the most",
    description:
      "A practical framework for turning a fuzzy idea into a focused first release.",
    date: "Aug 24, 2026",
    readTime: "6 min read",
  },
  {
    category: "Engineering",
    title: "Good software starts with a clear point of view",
    description:
      "Why constraints, taste, and a sharp problem statement matter more than another tool.",
    date: "Aug 12, 2026",
    readTime: "8 min read",
  },
  {
    category: "Notes",
    title: "A quiet system for doing meaningful work",
    description:
      "Simple habits for protecting attention, keeping momentum, and finishing what matters.",
    date: "Jul 30, 2026",
    readTime: "4 min read",
  },
];

export default function Home() {
  return (
    <main>
      <nav className="nav shell" aria-label="Primary navigation">
        <a className="wordmark" href="#top" aria-label="Northstar home">
          Northstar<span>.</span>
        </a>
        <div className="nav-links">
          <a href="#writing">Writing</a>
          <a href="#about">About</a>
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="eyebrow">
          <span aria-hidden="true" /> Independent ideas on building well
        </div>
        <h1>
          Thoughtful work.
          <br />
          <em>Clearly expressed.</em>
        </h1>
        <p className="hero-copy">
          Essays and field notes about product, engineering, and the craft of
          making useful things.
        </p>
        <a className="text-link" href="#writing">
          Explore the writing <span aria-hidden="true">↘</span>
        </a>
      </section>

      <section className="writing shell" id="writing" aria-labelledby="writing-title">
        <div className="section-heading">
          <p>01 / Latest</p>
          <h2 id="writing-title">Recent writing</h2>
        </div>

        <div className="post-list">
          {posts.map((post, index) => (
            <article className="post" key={post.title}>
              <div className="post-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="post-body">
                <p className="category">{post.category}</p>
                <h3>{post.title}</h3>
                <p className="description">{post.description}</p>
                <div className="post-meta">
                  <time>{post.date}</time>
                  <span>{post.readTime}</span>
                </div>
              </div>
              <span className="post-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="about" id="about" aria-labelledby="about-title">
        <div className="about-inner shell">
          <p className="about-label">02 / About</p>
          <div>
            <h2 id="about-title">Stay curious.<br />Make it useful.</h2>
            <p>
              Northstar is a small corner of the internet for ideas worth
              returning to—written with care, tested in practice, and shared
              without the noise.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer shell">
        <a className="wordmark" href="#top">
          Northstar<span>.</span>
        </a>
        <p>Ideas for people who make things.</p>
        <p>© {new Date().getFullYear()} Northstar</p>
      </footer>
    </main>
  );
}
