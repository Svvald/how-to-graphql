async function info() {
  return `This is the API of a Hackernews clone`;
}

async function feed(parents, args, context) {
  const where = args.filter
    ? {
      OR: [
        { description: { contains: args.filter } },
        { url: { contains: args.filter } },
      ],
    } : {};

  const links = await context.prisma.link.findMany({
    where,
    skip: args.skip,
    take: args.take,
    orderBy: args.orderBy,
  });

  const count = await context.prisma.link.count({ where });

  return {
    links,
    count,
  };
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
