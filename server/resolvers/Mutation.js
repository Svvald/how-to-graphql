const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const {APP_SECRET} = require('../utils');

async function post(parent, args, context) {
  const { userId } = context;

  return await context.prisma.link.create({
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
      id: parseInt(args.id, 10),
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
  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return { token, user };
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

module.exports = {
  post,
  updateLink,
  deleteLink,
  signup,
  login,
};
