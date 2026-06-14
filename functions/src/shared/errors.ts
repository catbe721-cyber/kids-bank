import { HttpsError } from "firebase-functions/v2/https";

export function unauthenticated(message = "Authentication required."): HttpsError {
  return new HttpsError("unauthenticated", message);
}

export function invalidArgument(message: string): HttpsError {
  return new HttpsError("invalid-argument", message);
}

export function permissionDenied(message = "Permission denied."): HttpsError {
  return new HttpsError("permission-denied", message);
}

export function tooManyRequests(message: string): HttpsError {
  return new HttpsError("resource-exhausted", message);
}

export function internal(message = "Internal error."): HttpsError {
  return new HttpsError("internal", message);
}
