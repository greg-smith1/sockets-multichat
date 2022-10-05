class SessionStore {
  findSession() {}
  saveSession() {}
  findAllSessions() {}
}


class InMemorySessionStore extends SessionStore {
  constructor() {
    super();
    this.session = new Map();
  }

  findSession(id) {
    return this.sessions.get(id);
  }

  saveSession(id, session) {
    this.sessions.set(id, session);
  }

  findAllSessions() {
    return [...this.sessions.values()];
  }
}

module.exports = {
  InMemorySessionStore
};
