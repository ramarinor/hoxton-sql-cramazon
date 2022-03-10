import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const items: Prisma.ItemCreateInput[] = [
  { title: 'Green Socks', image: 'green-socks.jpg', price: 1.99 },
  { title: 'Blue Pyjamas', image: 'blue-pyjamas.jpg', price: 9.49 },
  { title: 'Black Sunglasses', image: 'black-sunglasses.jpg', price: 25.24 },
  { title: 'Red Backpack', image: 'red-backpack.jpg', price: 19.99 }
];

const users: Prisma.UserCreateInput[] = [
  {
    name: 'Rinor',
    email: 'rinor@gmail.com',
    orders: {
      create: [
        { quantity: 10, item: { connect: { title: 'Green Socks' } } },
        { quantity: 2, item: { connect: { title: 'Black Sunglasses' } } }
      ]
    }
  },
  {
    name: 'Nicolas',
    email: 'nicolas@gmail.com',
    orders: {
      create: [
        { quantity: 15, item: { connect: { title: 'Green Socks' } } },
        { quantity: 1, item: { connect: { title: 'Red Bagpack' } } }
      ]
    }
  },
  {
    name: 'Ed',
    email: 'ed@gmail.com'
  }
];

async function createStuff() {
  for (const item of items) {
    await prisma.item.create({ data: item });
  }
  for (const user of users) {
    await prisma.user.create({ data: user });
  }
}
createStuff();
