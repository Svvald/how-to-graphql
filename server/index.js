const fs = require('fs');
const path = require('path');
const {ApolloServer} = require('apollo-server');

let links = [
  {
    id: 'link-0',
    url: 'https://howtographql.com',
    description: 'Fullstack tutorial for GraphQL',
  },
];

const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews clone`,
    feed: () => links,
    link: (parent, args) => {
      return links.find(link => link.id === args.id) || null;
    }
  },
  Mutation: {
    post: (parent, args) => {
      let idCount = links.length;

      const link = {
        id: `link-${idCount++}`,
        description: args.description,
        url: args.url,
      };

      links = links.concat(link);

      return link;
    },
    updateLink: (parent, args) => {
      let updatedLink;

      links = links.map(link => {
        if (link.id === args.id) {
          link = {
            ...link,
            description: args.description || link.description,
            url: args.url || link.url,
          };

          updatedLink = link;
        }

        return link;
      });

      return updatedLink || null;
    },
    deleteLink: (parent, args) => {
      let deletedLink;

      links = links.filter(link => {
        if (link.id === args.id) {
          deletedLink = link;
          return false;
        }

        return true;
      });

      return deletedLink || null;
    },
  },
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'schema.graphql'),
    'utf8',
  ),
  resolvers,
});

server.listen().then(({url}) => console.log(`Server is running on ${url}`));
