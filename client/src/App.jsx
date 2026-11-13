import { useState } from 'react';
import './App.css';

const lists = [
  {
    id: 1,
    title: 'To Do',
    cards: [
      { id: 1, title: 'Design the database', priority: 'high', due: 'Dec 1' },
      { id: 2, title: 'Write the API routes', priority: 'medium', due: 'Dec 5' },
      { id: 3, title: 'Plan the portfolio page', priority: 'low' },
    ],
  },
  {
    id: 2,
    title: 'Doing',
    cards: [
      {
        id: 4,
        title: 'Build the login page',
        priority: 'high',
        due: 'Tomorrow',
        soon: true,
      },
      { id: 5, title: 'Style the board', priority: 'medium' },
    ],
  },
  {
    id: 3,
    title: 'Done',
    cards: [{ id: 6, title: 'Set up the server', priority: 'low', done: true }],
  },
];

function App() {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" />
          TaskFlow
        </div>
        <div className="topbar-actions">
          <button className="ghost-btn" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button className="primary-btn">+ New board</button>
        </div>
      </header>

      <main className="board">
        {lists.map((list) => (
          <section className="list" key={list.id}>
            <div className="list-header">
              <h2>{list.title}</h2>
              <span className="count">{list.cards.length}</span>
            </div>

            {list.cards.map((card) => (
              <article
                className={`card${card.done ? ' done' : ''}`}
                data-priority={card.priority}
                key={card.id}
              >
                <h3 className="card-title">{card.title}</h3>
                <div className="card-meta">
                  {card.due && (
                    <span className={`chip${card.soon ? ' soon' : ''}`}>
                      {card.due}
                    </span>
                  )}
                  <span className="chip">{card.priority}</span>
                </div>
              </article>
            ))}

            <button className="add-card">+ Add a card</button>
          </section>
        ))}
      </main>
    </div>
  );
}

export default App;