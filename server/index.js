const { makeExecutableSchema } = require('@graphql-tools/schema');
const { PrismaClient } = require('@prisma/client');
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const fs = require('fs');
const { execute, subscribe } = require('graphql');
const { PubSub } = require('graphql-subscriptions');
const http = require('http');
const path = require('path');
const { SubscriptionServer } = require('subscriptions-transport-ws');

const { getUserId } = require('./src/utils');
const Query = require('./src/resolvers/Query');
const Mutation = require('./src/resolvers/Mutation');
const User = require('./src/resolvers/User');
const Link = require('./src/resolvers/Link');
const Subscription = require('./src/resolvers/Subscription');
const Vote = require('./src/resolvers/Vote');

(async function startApolloServer() {
  const resolvers = {
    Query,
    Mutation,
    User,
    Link,
    Subscription,
    Vote,
  };

  const typeDefs = fs.readFileSync(
    path.join(__dirname, 'schema.graphql'),
    'utf8',
  );

  const prisma = new PrismaClient();
  const pubsub = new PubSub();

  const app = express();

  const httpServer = http.createServer(app);

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      return {
        ...req,
        prisma,
        pubsub,
        userId: req && req.headers.authorization ? getUserId(req) : null,
      };
    },
  });

  await server.start();
  server.applyMiddleware({
    app,
    path: '/',
  });

  const subscriptionServer = SubscriptionServer.create({
    schema,
    execute,
    subscribe,
    onConnect: async () => {
      return { prisma, pubsub };
    },
  }, {
    server: httpServer,
    path: server.graphqlPath,
  });

  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => subscriptionServer.close());
  });

  const PORT = 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  });
})();
