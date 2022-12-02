require('dotenv').config();

const { DB_NAME } = process.env;

const okHandler = (result) => {
  try {
    // test deploy 2
    const { ok } = result.result
    return Boolean(ok);
  } catch (e) {
    console.error('ERROR IN MONGO DRIVER: NO OK IN RESULT');
    return false;
  }
}

const methods = {
  update: (collection) => async (filter, setValue) => okHandler(await collection.updateOne(filter, { $set: setValue })),
  insert: (collection) => async (value) => okHandler(await collection.insertOne(value)),
  findOne: (collection) => async (value) => collection.findOne(value),
  findAll: (collection) => async () => collection.find().toArray(),
  findMany: (collection) => async (query) => collection.find(query).toArray(),
}

export default async (mongoClient, collectionName) => {  
  const collection = await mongoClient.db(DB_NAME).collection(collectionName);

  return {
    update: methods.update(collection),
    insert: methods.insert(collection),
    findOne: methods.findOne(collection),
    findAll: methods.findAll(collection),
    findMany: methods.findMany(collection),
  }
}
