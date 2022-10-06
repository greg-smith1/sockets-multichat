class MessageStore {
  saveMessage(message) {}
  findMessagesForUser(userID) {} 
}

class InMemoryMessageStore extends MessageStore {
  constructor() {
    super();
    this.messages = [];
    // TODO: add redis
  }

  saveMessage(message) {
    this.messages.push(message);
  }

  findMessagesForUser(userID) {
    return this.messages.filter(
      ({to, from}) => from === userID || to === userID
    );
  }
};

module.exports = {
  InMemoryMessageStore,
};
