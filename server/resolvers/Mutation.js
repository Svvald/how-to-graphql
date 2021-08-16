const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const {APP_SECRET} = require('../utils');

async function post(parent, args, context) {
  const { userId } = context;

  const newLink = await context.prisma.link.create({
    data: {
      url: args.url,
      description: args.description,
      postedBy: {
        connect: {
          id: userId,
        },
      },
    },
  });

  await context.pubsub.publish('NEW_LINK', { newLink });

  return newLink;
}

async function updateLink(parent, args, context) {
  const updatedLink = await context.prisma.link.update({
    where: {
      id: parseInt(args.id, 10),
    },
    data: {
      url: args.url,
      description: args.description,
    }
  });

  return updatedLink || null;
}

async function deleteLink(parent, args, context) {
  const deletedLink = await context.prisma.link.delete({
    where: {
      id: Number(args.id),
    },
  });

  return deletedLink || null;
}

async function signup(parent, args, context) {
  const password = await bcrypt.hash(args.password, 10);
  const user = await context.prisma.user.create({
    data: {
      ...args,
      password,
    },
  });
  const token = jwt.sign({userId: user.id}, APP_SECRET);

  return {token, user};
}

async function login(parent, args, context) {
  const user = await context.prisma.user.findUnique({
    where: {
      email: args.email,
    },
  });

  if (!user) {
    throw new Error('No such user found!');
  }

  const valid = await bcrypt.compare(args.password, user.password);

  if (!valid) {
    throw new Error('Invalid password!');
  }

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return { token, user };
}

async function vote(parent, args, context) {
  const userId = context.userId;

  const vote = await context.prisma.vote.findUnique({
    where: {
      linkId_userId: {
        linkId: Number(args.linkId),
        userId,
      },
    },
  });

  if (Boolean(vote)) {
    throw new Error(`Already voted for link ${args.linkId}`);
  }

  const newVote = context.prisma.vote.create({
    data: {
      user: { connect: { id: userId } },
      link: { connect: { id: Number(args.linkId) } },
    },
  });

  await context.pubsub.publish('NEW_VOTE', { newVote });

  return newVote;
}

module.exports = {
  post,
  updateLink,
  deleteLink,
  signup,
  login,
  vote,
};
