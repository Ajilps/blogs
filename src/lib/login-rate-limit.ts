import "server-only";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { getDatabase } from "@/lib/mongodb";

const WINDOW_SECONDS = 15 * 60;
const MAX_ATTEMPTS = 5;

type LoginAttempt = {
  key: string;
  createdAt: Date;
};

let indexPromise: Promise<unknown> | undefined;

async function getAttemptCollection() {
  const collection = (await getDatabase()).collection<LoginAttempt>("admin_login_attempts");
  indexPromise ??= Promise.all([
    collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: WINDOW_SECONDS }),
    collection.createIndex({ key: 1, createdAt: -1 }),
  ]);
  await indexPromise;
  return collection;
}

async function getRequestKey() {
  const requestHeaders = await headers();
  const address =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown";
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "ajil-notes";
  return createHmac("sha256", secret).update(address).digest("hex");
}

export async function loginIsAllowed() {
  try {
    const collection = await getAttemptCollection();
    const key = await getRequestKey();
    const since = new Date(Date.now() - WINDOW_SECONDS * 1000);
    return (await collection.countDocuments({ key, createdAt: { $gte: since } })) < MAX_ATTEMPTS;
  } catch (error) {
    console.error("Login rate-limit check unavailable", error);
    return true;
  }
}

export async function recordLoginFailure() {
  try {
    const collection = await getAttemptCollection();
    await collection.insertOne({ key: await getRequestKey(), createdAt: new Date() });
  } catch (error) {
    console.error("Could not record failed login", error);
  }
}

export async function clearLoginFailures() {
  try {
    const collection = await getAttemptCollection();
    await collection.deleteMany({ key: await getRequestKey() });
  } catch (error) {
    console.error("Could not clear login attempts", error);
  }
}
