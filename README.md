# ZK Poseidon Demo (Circom + snarkjs)

## Overview

This project is a minimal zero-knowledge proof demo built using Circom and snarkjs. It includes two independent pipelines:

1. **Poseidon hash proof** — prove knowledge of a secret whose Poseidon hash matches a public value.
2. **Merkle membership proof** — prove that a private leaf sits under a public Merkle root using Poseidon at each level (fixed depth 3, eight leaves).

The goal is a working zk-SNARK foundation for coursework or a future privacy-oriented dApp.

---

## What each demo proves

### Hash demo

> "I know a secret such that Poseidon(secret) = publicHash"

* `secret` — private  
* `publicHash` — public  

### Merkle demo

> "I know a leaf and an authentication path such that this leaf is in the Merkle tree with the given public root."

* `root` — public  
* `leaf`, `pathElements`, `pathIndices` — private  
* `pathIndices[i] = 0` means the current node is the **left** input to `Poseidon(left, right)` at that level; `1` means **right**.

---

## Tech stack

* Circom (circuits)
* snarkjs (witness, Groth16 prove/verify)
* Poseidon (`circomlib` / `circomlibjs`)
* Groth16

---

## Project structure

```
circuits/           # hash.circom, merkle.circom
scripts/           # compile / setup / witness / prove / verify (+ merkle-*)
build/             # generated: wasm, r1cs, zkey, ptau, proofs (gitignored mostly)
input.json         # hash demo input (secret + publicHash)
input-merkle.json  # merkle demo input (from merkle:gen-input)
CHANGELOG.md       # dated project log (中文)
```

---

## Prerequisites

* Node.js  
* npm dependencies: `npm install`  
* Circom installed on your PATH (Windows: Rust + MSVC if building from source)  
* `snarkjs` is used via `npx` from the local `node_modules`

---

## Run: Poseidon hash demo

```bash
npm install
npm run compile
npm run setup
npm run gen-input
npm run witness
npm run prove
npm run verify
```

One shot:

```bash
npm run all
```

Success ends with: `[INFO] snarkJS: OK!`

---

## Run: Merkle membership demo

```bash
npm run merkle:compile
npm run merkle:setup
npm run merkle:gen-input
npm run merkle:witness
npm run merkle:prove
npm run merkle:verify
```

One shot:

```bash
npm run merkle:all
```

Optional leaf index `0`–`7` (default `2`):

```bash
node scripts/merkle-gen-input.cjs 5
npm run merkle:witness && npm run merkle:prove && npm run merkle:verify
```

`merkle:gen-input` prints leaves, chosen leaf, sibling path, path indices, and computed root.

---

## Example (hash)

Private: `secret = 12345`  
Public: `publicHash = Poseidon(secret)`  

The verifier checks the proof and `publicHash` only.

---

## Why Poseidon?

Poseidon is designed for zk circuits; it is far cheaper in constraints than SHA256.

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a dated log (e.g. 2026-03-28 hash demo, 2026-03-30 Merkle).

---

## Next steps (ideas)

* Anonymous group membership on top of Merkle roots  
* On-chain Groth16 verifier (Solidity)  
* Leaf as a commitment (hash leaf before inserting) if you need to match a specific protocol  

---

## Notes

* Trusted setup is local and for learning only — not production-safe.  
* Merkle tree uses **raw field elements** as leaves; parents are `Poseidon(left, right)`. Adjust the circuit if your protocol hashes leaves first.  
