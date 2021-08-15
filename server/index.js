const {PrismaClient} = require('@prisma/client');
const {ApolloServer} = require('apollo-server');
const fs = require('fs');
const path = require('path');

const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews clone`,

    feed: async (parents, args, context) => {
      return await context.prisma.link.findMany();
    },

    link: async (parent, args, context) => {
      return await context.prisma.link.findUnique({
        where: {
          id: parseInt(args.id, 10),
        },
      });
    }
  },

  Mutation: {
    post: async (parent, args, context) => {
      return await context.prisma.link.create({
        data: {
          url: args.url,
          description: args.description,
        },
      });
    },

    updateLink: async (parent, args, context) => {
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
    },

    deleteLink: async (parent, args, context) => {
      const deletedLink = await context.prisma.link.delete({
        where: {
          id: parseInt(args.id, 10),
        },
      });

      return deletedLink || null;
    },
  },
};

const prisma = new PrismaClient();

const server = new ApolloServer({
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'schema.graphql'),
    'utf8',
  ),
  resolvers,
  context: {
    prisma,
  },
});

server.listen().then(({url}) => console.log(`Server is running on ${url}`));
