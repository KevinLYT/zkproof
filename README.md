# zkproof

`zkproof` is my zero-knowledge proof module for a zk-gated messaging dApp. It started as a Circom/snarkjs learning demo and was upgraded into the proof layer that can connect to the current message dApp and local message contract.

The main upgrade is:

```txt
Merkle membership proof
  -> message-bound proof
  -> nullifier-based replay protection
  -> Solidity verifier + message contract integration
```

## What This Proves

The upgraded Merkle circuit proves:

```txt
I know a private leaf and Merkle path for the public root,
and this proof is bound to one public messageHash,
with one public nullifierHash for replay protection.
```

Public signals:

```txt
root
messageHash
nullifierHash
```

Private witness:

```txt
leaf
pathElements
pathIndices
nullifier
```

The important constraint added for the dApp is:

```txt
nullifierHash = Poseidon(nullifier, messageHash)
```

## How It Connects To The dApp

This repo owns the proof side:

- Circom circuit: `circuits/merkle.circom`
- input/proof scripts: `scripts/merkle-*.cjs`
- Solidity verifier: `contracts/contracts/Verifier.sol`
- zk-gated message contract: `contracts/contracts/MyContract.sol`

The dApp owns the user flow:

```txt
wallet connects
  -> user writes message
  -> Next.js API generates Groth16 proof
  -> frontend calls MyContract.sendMessageWithProof(...)
  -> contract recomputes messageHash
  -> verifier checks [root, messageHash, nullifierHash]
  -> message is stored only if proof is valid
```

The compatible contract entrypoint is:

```solidity
sendMessageWithProof(
    address _to,
    string calldata _content,
    uint[2] calldata _pA,
    uint[2][2] calldata _pB,
    uint[2] calldata _pC,
    uint256 _nullifierHash
)
```

## Difference From The Original NYUSH Capstone dApp

The earlier NYUSH capstone dApp was a normal wallet-based messaging app:

- connect wallet with thirdweb
- call `sendMessage(address,string)`
- read received messages from the contract

This upgraded version changes the security model:

- message sending now requires a valid zk proof
- the frontend calls `/api/generate-proof` before submitting a transaction
- the contract verifies `root`, `messageHash`, and `nullifierHash`
- `usedNullifierHashes` prevents proof replay
- the proof is bound to the exact message content, because the contract recomputes `sha256(content) % FIELD_SIZE`

So the project moved from:

```txt
wallet identity -> direct on-chain message
```

to:

```txt
wallet identity + zk membership proof + message binding -> gated on-chain message
```

## Project Structure

```txt
circuits/                 Circom hash and Merkle message-gate circuits
scripts/                  snarkjs compile/setup/witness/prove/verify helpers
contracts/contracts/      Groth16Verifier and MyContract
contracts/test/           Truffle integration test for proof-gated messaging
input-merkle.json         sample Merkle/message/nullifier input
update.md                 Chinese upgrade notes
CHANGELOG.md              dated project log
```

Generated proof artifacts are kept under `build/` locally and are intentionally ignored by git.

## Run The Proof Pipeline

```bash
npm install
npm run merkle:compile
npm run merkle:setup
npm run merkle:gen-input
npm run merkle:witness
npm run merkle:prove
npm run merkle:verify
```

One command:

```bash
npm run merkle:all
```

Optional arguments:

```bash
node scripts/merkle-gen-input.cjs 2 "gm zk world" 9002
```

The generated public signals are:

```txt
[root, messageHash, nullifierHash]
```

## Run The Contract Integration Test

The Truffle test deploys:

1. `Groth16Verifier`
2. `MyContract(verifier, root)`

Then it verifies the proof, calls `sendMessageWithProof`, confirms the message was stored, and checks that replaying the same nullifier is rejected.

```bash
cd contracts
npm install
npm test
```

Expected result:

```txt
verifyProof => true
2 passing
```

## Export Solidity Calldata

```bash
cd contracts
npm run proof-args
```

This prints:

- `a`
- `b`
- `c`
- `input`

The `b` coordinates are formatted for the Solidity verifier.

## Compatibility Notes

- The circuit, dApp backend artifacts, and deployed `Groth16Verifier` must come from the same `.zkey`.
- If the circuit or trusted setup is regenerated, redeploy the verifier and update the dApp's `wasm`, `zkey`, `verification_key`, contract address, and Merkle root together.
- The demo Merkle tree uses raw field elements as leaves: `100` through `107`.
- The current default leaf is index `2`, with default nullifier `9002`.
- This is a learning/capstone-grade demo, not audited production cryptography.

## Project Links

- Previous NYU capstone messaging app: `https://github.com/KevinLYT/NYUSH_Capstone_Project`
- My zk proof module: `https://github.com/KevinLYT/zkproof`
- My upgraded zk message dApp: `https://github.com/KevinLYT/zk-message-dapp`

This repo keeps the zk proof module under my own project name, `zkproof`, and documents the upgrade path from the original proof demo to a dApp-compatible proof gate.
