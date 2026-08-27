import "server-only";

import { MongoClient, ServerApiVersion } from "mongodb";

declare global {
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

let productionClientPromise: Promise<MongoClient> | undefined;

function createClientPromise() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  const client = new MongoClient(uri, {
    appName: "ajil-notes",
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  return client.connect();
}

export function getMongoClient() {
  if (process.env.NODE_ENV === "development") {
    global.mongoClientPromise ??= createClientPromise();
    return global.mongoClientPromise;
  }

  productionClientPromise ??= createClientPromise();
  return productionClientPromise;
}

export async function getDatabase() {
  const client = await getMongoClient();
  return client.db(process.env.MONGODB_DB || "ajil_blog");
}
