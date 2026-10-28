// Run: node scripts/auth-check.ts
import assert from "node:assert/strict";
import { authErrorMessage, authErrorCode, sanitizeUsername, signUpError } from "../src/lib/authErrors.ts";

assert.equal(sanitizeUsername("Tony Stark!_99"), "tonystark_99");
assert.equal(signUpError("abc", "abc"), "Choose a password with at least 6 characters.");
assert.match(signUpError("secret1", "secret2") ?? "", /don't match/);
assert.equal(signUpError("secret1", "secret1"), null);

assert.equal(authErrorCode({ code: "invalid_credentials" }), "invalid_credentials");
assert.equal(authErrorCode({ message: "Email not confirmed" }), "email_not_confirmed");
assert.match(authErrorMessage({ message: "User already registered" }), /already exists/);
assert.match(authErrorMessage(new TypeError("Failed to fetch")), /connection/);
assert.match(authErrorMessage({ message: "weird internal thing" }), /Something went wrong/);

console.log("auth-check: all assertions passed");
