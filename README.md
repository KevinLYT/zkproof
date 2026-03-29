# ZK Poseidon Demo (Circom + snarkjs)

## Overview

This project is a minimal zero-knowledge proof demo built using Circom and snarkjs.
It proves that a user knows a secret value whose Poseidon hash matches a given public hash, without revealing the secret itself.

The goal of this project is to build a working zk-SNARK pipeline as a foundation for a larger privacy-preserving dApp.

---

## What this demo does

We prove the following statement:

> "I know a secret such that Poseidon(secret) = publicHash"

* `secret` is private (never revealed)
* `publicHash` is public
* The verifier only checks the proof, not the secret

---

## Tech Stack

* Circom (circuit definition)
* snarkjs (proof generation and verification)
* Poseidon hash (zk-friendly hash function)
* Groth16 (zk-SNARK proving system)

---

## Project Structure

```
circuits/          # Circom circuits
scripts/           # helper scripts (compile, setup, prove, verify)
build/             # generated artifacts (wasm, r1cs, zkey, etc.)
input.json         # example input (secret + public hash)
```

---

## How to Run

Make sure you have installed:

* Node.js
* snarkjs
* Circom (with Rust + MSVC toolchain on Windows)

Then run:

```
npm install
npm run compile
npm run setup
npm run witness
npm run prove
npm run verify
```

If everything works, you should see:

```
[INFO] snarkJS: OK!
```

---

## Example

Private input:

```
secret = 12345
```

Public input:

```
publicHash = Poseidon(secret)
```

The proof shows that the prover knows `secret`, but the verifier only sees the proof and `publicHash`.

---

## Why Poseidon?

Poseidon is a hash function designed for zero-knowledge circuits.
Compared to SHA256, it is much more efficient inside zk-SNARK constraints.

---

## Next Steps

This is only a minimal demo. The next step is to extend it into:

* Merkle tree membership proof
* Anonymous group membership
* Integration with a smart contract verifier

Ultimately, this will be used to build a privacy-preserving messaging dApp.

---

## Notes

* The trusted setup here is local and for demo purposes only
* Not secure for production use
* This project is intended for learning and experimentation
