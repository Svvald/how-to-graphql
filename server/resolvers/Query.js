async function info() {
  return `This is the API of a Hackernews clone`;
}

async function feed(parents, args, context) {
  return await context.prisma.link.findMany();
}

async function link(parent, args, context) {
  return await context.prisma.link.findUnique({
    where: {
      id: parseInt(args.id, 10),
    },
  });
}

module.exports = {
  info,
  feed,
  link,
};
