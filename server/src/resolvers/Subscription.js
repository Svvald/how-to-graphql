const newLink = {
  subscribe: (parent, args, context) => context.pubsub.asyncIterator('NEW_LINK'),
};

const newVote = {
  subscribe: (parent, args, context) => context.pubsub.asyncIterator('NEW_VOTE'),
};

module.exports = {
  newLink,
  newVote,
};
