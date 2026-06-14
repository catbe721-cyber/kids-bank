#!/usr/bin/env node
/**
 * PIN Hash Generator
 * ------------------
 * Run this ONCE locally to generate the bcrypt hash of your chosen 6-digit PIN.
 * The hash is then stored in Firebase Secret Manager — never in code.
 *
 * Usage:
 *   node scripts/generate-pin-hash.mjs
 *
 * Then set the hash in Firebase:
 *   firebase functions:secrets:set PIN_HASH
 *   (paste the output hash when prompted)
 */

import { createInterface } from "readline";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const bcrypt = require("bcryptjs");

const rl = createInterface({ input: process.stdin, output: process.stdout });

rl.question("Enter your 6-digit PIN: ", async (pin) => {
  if (!/^\d{6}$/.test(pin)) {
    console.error("❌ PIN must be exactly 6 digits.");
    rl.close();
    process.exit(1);
  }

  console.log("⏳ Generating bcrypt hash (this takes a moment)...");
  const hash = await bcrypt.hash(pin, 12);
  console.log("\n✅ Your PIN hash:");
  console.log(hash);
  console.log("\n📋 Copy this hash and run:");
  console.log("   firebase functions:secrets:set PIN_HASH");
  console.log("   (paste the hash above when prompted)\n");
  rl.close();
});
