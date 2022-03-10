import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  log: ['query', 'error', 'info', 'warn']
});

const PORT = 4000;

const app = express();
app.use(cors());
app.use(express.json());
// - Get a list of items
app.get('/items', async (req, res) => {
  try {
    const items = await prisma.item.findMany();
    res.send(items);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

// - View an individual item
app.get('/items/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const item = await prisma.item.findUnique({ where: { title } });
    if (item) res.send(item);
    else res.status(404).send({ error: 'Item not found' });
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

// - View user information
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.send(users);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.get('/users/:email', async (req, res) => {
  const email = req.params.email;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { orders: { select: { quantity: true, id: true, item: true } } }
    });
    if (user) res.send(user);
    else res.status(404).send({ error: 'User not found' });
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});
// - Place (create) an order
app.post('/orders', async (req, res) => {
  const { email, title, quantity } = req.body;
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { orders: { create: { quantity, item: { connect: { title } } } } },
      include: { orders: { select: { quantity: true, id: true, item: true } } }
    });
    res.send(user);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});
// - Create a new item

app.post('/items', async (req, res) => {
  const { title, image, price } = req.body;
  try {
    const item = await prisma.item.create({ data: { title, image, price } });
    res.send(item);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});
// - Update an existing user
app.patch('/users/:email', async (req, res) => {
  const currentEmail = req.params.email;
  const { name, email } = req.body;
  try {
    let user = await prisma.user.findUnique({ where: { email: currentEmail } });
    if (user) {
      user = await prisma.user.update({
        where: { email: currentEmail },
        data: { email: email ?? user.email, name: name ?? user.name },
        include: {
          orders: { select: { quantity: true, id: true, item: true } }
        }
      });
      res.send(user);
    } else res.status(404).send({ error: 'User not found' });
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});
// - Cancel (delete) an order
app.delete('/orders/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { email } = req.body;
  try {
    const order = await prisma.order.findUnique({ where: { id } });
    let user = await prisma.user.findUnique({
      where: { email },
      include: { orders: { select: { quantity: true, id: true, item: true } } }
    });
    if (order && user && order.userId === user.id) {
      await prisma.order.delete({ where: { id } });
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          orders: { select: { quantity: true, id: true, item: true } }
        }
      });
      res.send(user);
    } else {
      res.status(404).send({ error: 'This order does not exist!' });
    }
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server up: http://localhost:${PORT}`));
