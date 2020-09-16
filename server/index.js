import db from './supabase.js';
import express from 'express';
import bodyParser from 'body-parser';
import asyncHandler from 'express-async-handler';

const app = express();
//  Able to parse JSON, for post requests
app.use(bodyParser.json());


//  TODO: move somewhere, like constants
const PORT = 6969;

//  TODO: move this somewhere, perhaps ./supabase.js
async function getHitsCount() {
  const { body } = await db
    .from('hits')
    .select('hits_count');
  const { hits_count: hitsCount } = body[0]; // Returns every row, but we're only storing in the first row.
  return hitsCount;
}

// //  For testing purposes
app.get('/', (req, res, next) => {
  res.json({
    message: '🍕 Welcome to annelisa.pizza! Here are some routes you can hit!',
    routes: {
      hits: '/hits',
    },
  });
  return next();
});

//  GET /hits
app.get('/hits', asyncHandler(async (req, res, next) => {
  //  Get the data from the DB
  const hitsCount = await getHitsCount();
  //  Send the response
  res.send({ hitsCount });
}));

//  PUT /hits
app.put('/hits', asyncHandler(async (req, res, next) => {
  const hitsCount = await getHitsCount();
  const { body } = await db
    .from('hits')
    .update({ hits_count: hitsCount + 1 })
    .eq('id', 1); // TODO: Store this as a const somewhere
  const { hits_count: updatedHitsCount } = body[0]
  res.send({
    hitsCount: updatedHitsCount,
  });
  return next();
}));

// GET /guestbook
app.get('/guestbook', asyncHandler(async (req, res, next) => {
  //  Get the data from the DB
  const { body: entries } = await db
    .from('guestbook')
    .select('*');
  //  Send the response
  res.send({ entries });
}));


//  POST /guestbook
app.post('/guestbook', asyncHandler(async (req, res, next) => {
  const { name, text } = req.body;
  if (!name) {
    return res.send({
      error: `🙅‍♀️ Bad request! No name provided!`,
      code: 400,
    });
  }
  if (!text) {
    return res.send({
      error: `🙅‍♀️ Bad request! No text provided!`,
      code: 400,
    });
  }
  await db
    .from('guestbook')
    .insert([
      {
        name,
        text,
        created_at: new Date(),
      }
    ]);
  res.sendStatus(200);
}));

app.listen(PORT, () => {
  console.log(`🍕 Come get some pizza at http://localhost:6969`)
});
