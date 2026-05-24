import { startTransition, useDeferredValue, useEffect, useState } from 'react';

const STORAGE_KEY = 'pulse-tasks.todos';

const FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '进行中' },
  { value: 'completed', label: '已完成' },
];

function loadTodos() {
  try {
    const savedTodos = window.localStorage.getItem(STORAGE_KEY);
    return savedTodos ? JSON.parse(savedTodos) : [];
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // Ignore storage failures so the UI still works without persistence.
  }
}

function createTodo(text) {
  return {
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: Date.now(),
  };
}

export default function App() {
  const [todos, setTodos] = useState(loadTodos);
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const filteredTodos = todos
    .filter((todo) => {
      if (filter === 'active') {
        return !todo.completed;
      }
      if (filter === 'completed') {
        return todo.completed;
      }
      return true;
    })
    .filter((todo) => todo.text.toLowerCase().includes(deferredSearch))
    .sort((a, b) => b.createdAt - a.createdAt);

  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.length - activeCount;

  function addTodo(event) {
    event.preventDefault();
    const nextText = draft.trim();

    if (!nextText) {
      return;
    }

    setTodos((currentTodos) => [createTodo(nextText), ...currentTodos]);
    setDraft('');
  }

  function toggleTodo(todoId) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  function removeTodo(todoId) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== todoId));
  }

  function clearCompleted() {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.completed));
  }

  function handleFilterChange(nextFilter) {
    startTransition(() => {
      setFilter(nextFilter);
    });
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">PULSE TASKS</p>
          <h1>把今天要做的事，整理得更清楚一点。</h1>
          <p className="hero-text">
            用一个轻量的待办事项面板，记录任务、切换状态，并自动保存在浏览器本地。
          </p>
        </div>

        <div className="hero-stats">
          <article>
            <span>总任务</span>
            <strong>{todos.length}</strong>
          </article>
          <article>
            <span>进行中</span>
            <strong>{activeCount}</strong>
          </article>
          <article>
            <span>已完成</span>
            <strong>{completedCount}</strong>
          </article>
        </div>
      </section>

      <section className="board">
        <form className="task-form" onSubmit={addTodo}>
          <label className="field">
            <span>新增任务</span>
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="例如：整理下周演示稿"
              maxLength={100}
            />
          </label>
          <button className="primary-button" type="submit">
            添加任务
          </button>
        </form>

        <div className="toolbar">
          <div className="filters" role="tablist" aria-label="任务筛选">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                className={item.value === filter ? 'filter-chip active' : 'filter-chip'}
                type="button"
                onClick={() => handleFilterChange(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className="search-field">
            <span className="sr-only">搜索任务</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索任务"
            />
          </label>
        </div>

        <div className="task-panel">
          {filteredTodos.length > 0 ? (
            <ul className="task-list">
              {filteredTodos.map((todo) => (
                <li key={todo.id} className={todo.completed ? 'task-item done' : 'task-item'}>
                  <button
                    className="toggle-button"
                    type="button"
                    onClick={() => toggleTodo(todo.id)}
                    aria-label={todo.completed ? '标记为未完成' : '标记为完成'}
                  >
                    <span />
                  </button>

                  <div className="task-content">
                    <p>{todo.text}</p>
                    <small>
                      {new Date(todo.createdAt).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </small>
                  </div>

                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => removeTodo(todo.id)}
                  >
                    删除
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <h2>当前没有匹配的任务</h2>
              <p>试着添加一条新任务，或者切换筛选条件。</p>
            </div>
          )}
        </div>

        <footer className="board-footer">
          <p>
            剩余 <strong>{activeCount}</strong> 项待完成
          </p>
          <button
            className="ghost-button"
            type="button"
            onClick={clearCompleted}
            disabled={completedCount === 0}
          >
            清除已完成
          </button>
        </footer>
      </section>
    </main>
  );
}
