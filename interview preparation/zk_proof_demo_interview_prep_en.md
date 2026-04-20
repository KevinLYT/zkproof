# ZK Proof Demo Interview Notes (English)

## 1. What this project is

This project is a zero-knowledge proof demo built with `Circom`, `snarkjs`, `Poseidon`, and `Groth16`.

The main goal was not to ship a full product immediately. The goal was to build and verify the core zk pipeline end to end:

1. express a statement as circuit constraints,
2. generate a witness from private inputs,
3. generate a proof and verify it locally,
4. export a Solidity verifier and validate the proof in a contract environment.

This repository currently contains two separate demos:

1. `Hash proof`: prove knowledge of a secret such that `Poseidon(secret) = publicHash`.
2. `Merkle membership proof`: prove that a private leaf belongs to a public Merkle root without revealing the leaf directly.

A concise interview version would be:

This was a zk-SNARK foundation project where I implemented the full path from circuit design to on-chain-style verification, so I could understand how zero-knowledge systems work at the engineering level instead of only at the concept level.

## 2. What I built

### 2.1 Hash proof demo

The circuit is in [hash.circom](/Users/kevinlee/Desktop/Kevin/zk_proof_demo/circuits/hash.circom:1).

It proves the statement:

`I know a private secret whose Poseidon hash equals a public hash.`

In this circuit:

- `secret` is private
- `publicHash` is public

This is the smallest useful zk example in the project. It turns the abstract idea of "proving knowledge without revealing the value" into an actual runnable pipeline.

### 2.2 Merkle membership demo

The circuit is in [merkle.circom](/Users/kevinlee/Desktop/Kevin/zk_proof_demo/circuits/merkle.circom:1).

It proves:

`I know a private leaf and a valid authentication path to a public Merkle root.`

In this circuit:

- `root` is public
- `leaf`, `pathElements`, and `pathIndices` are private

The tree depth is fixed at 3, so there are 8 leaves in total. Each internal node is computed with `Poseidon(left, right)`. The `pathIndices` array tells the circuit whether the current node is the left or right child at each level.

This part is more representative of real privacy systems because anonymous identity and group membership schemes often rely on exactly this kind of proof.

## 3. Why I built it this way

### 3.1 Why start with a demo instead of a full DApp

In zk systems, the hardest part is usually not the frontend or the contract wrapper. The hard part is making sure the proof pipeline is actually correct.

Before building a larger application, I wanted to validate:

1. whether the circuit constraints correctly represent the statement,
2. whether witness generation is stable,
3. whether the proving and verification key flow is correct,
4. whether proofs verify correctly,
5. whether Solidity verifier inputs match the generated proof format.

Building the minimal end-to-end flow first gave me a reliable technical base for more advanced privacy applications later.

### 3.2 Why Poseidon

Poseidon is designed for zk circuits. Compared with traditional hash functions like SHA256, it is much more efficient in terms of circuit constraints.

In other words, in a zk setting I care not only about whether hashing works, but also whether the hash function is cheap enough to use inside the circuit. Poseidon is much better suited for that.

### 3.3 Why Merkle membership

Because it upgrades the statement from "I know a secret" to "I belong to an authorized set."

That is much closer to real-world privacy applications such as:

- anonymous membership
- privacy-preserving access control
- anonymous messaging
- group-based authentication

### 3.4 Why export a Solidity verifier

Because a zk project is much more valuable if the proof can be consumed by smart contracts.

Local verification only shows that the proof is mathematically valid. A Solidity verifier shows that the proof can actually be integrated into blockchain application logic, such as access control or identity gating.

This repository already exports a verifier from the final `zkey` and tests `verifyProof` through Truffle.

## 4. What this repository directly proves

Based on the current repository snapshot, I can directly support the following claims:

1. I implemented two Circom circuits: a hash proof and a Merkle membership proof.
2. I scripted the full zk workflow: compile, setup, input generation, witness generation, proof generation, and verification.
3. I used `Groth16`.
4. I exported a Solidity verifier.
5. I tested proof verification in the `contracts/` subproject with Truffle and Ganache.

The strongest code references are:

- [README.md](/Users/kevinlee/Desktop/Kevin/zk_proof_demo/README.md:1)
- [CHANGELOG.md](/Users/kevinlee/Desktop/Kevin/zk_proof_demo/CHANGELOG.md:1)
- [merkle_verify.test.js](/Users/kevinlee/Desktop/Kevin/zk_proof_demo/contracts/test/merkle_verify.test.js:1)

## 5. How to connect this repo to my resume story

On my resume, the broader project is framed as a "Zero-Knowledge Anonymous Messaging System." This repository is best presented as the cryptographic core prototype behind that larger story.

The safest explanation is:

My broader goal was to build privacy-preserving authentication for an anonymous messaging system, where users could prove eligibility without exposing their wallet addresses. To support that, I first built a zk proof demo containing Poseidon-based proofs, Merkle membership verification, and the Solidity verifier pipeline. This repository served as the foundational prototype for the anonymous identity layer.

That framing works well because:

1. it matches the resume direction,
2. it stays honest about what this repository actually contains,
3. it lets me move naturally from product motivation to proof mechanics when I am asked follow-up questions.

## 6. A strong interview-ready project introduction

### Version A: around 1 minute

This project was a zk proof demo that I built to understand the full engineering path of zero-knowledge systems. I used Circom and snarkjs to implement two proofs. The first proves knowledge of a secret without revealing the secret itself. The second proves that a private leaf belongs to a public Merkle root, which is closer to real anonymous membership scenarios. I also exported a Solidity verifier and tested proof verification in a contract environment, so the project went beyond local scripts. The biggest value of this work was that it helped me understand how circuit design, proof generation, and contract-side verification fit together in a practical zk workflow.

### Version B: around 2 minutes

I built this project as a zk-SNARK foundation prototype. My goal was to verify the full proof pipeline before building larger privacy-preserving applications such as anonymous identity or anonymous messaging. I started with a minimal Poseidon hash proof, where the prover can show knowledge of a secret whose hash matches a public value. Then I extended that into a Poseidon-based Merkle membership proof, where the prover shows membership in a set without revealing the exact leaf. That second part is especially important because many privacy systems depend on proving set membership rather than only knowledge of a single value. On the engineering side, I scripted the entire flow from compilation and setup to witness generation, proof generation, and verification. I also exported the final verifier into Solidity and tested `verifyProof` through Truffle. Overall, this project gave me a much more concrete understanding of how zero-knowledge proofs move from mathematical statements into usable blockchain components.

## 7. Why this project fits my background

This project fits my resume well for a few reasons:

1. I have coursework related to cryptography and core computer science.
2. I also worked on blockchain and messaging-related projects, so this was a natural next step rather than an isolated experiment.
3. My internship background in systems, data, and engineering workflows helps me position myself as someone who can bridge theory and implementation.

A good personal framing is:

I like taking an abstract technical idea and breaking it down into the underlying primitives, then rebuilding it into a working system. In this case, that meant Merkle trees, Poseidon hashing, circuit constraints, and verifier contracts.

## 8. Interview questions and sample answers

### Q1: What problem does this project solve?

A: It solves the problem of proving a condition without revealing the sensitive underlying data. At the basic level, that means proving knowledge of a secret without exposing it. At a more useful level, it means proving membership in a set without revealing which member I am. That is useful for anonymous identity and privacy-preserving authentication.

### Q2: Why move from a hash proof to a Merkle proof?

A: A hash proof only shows knowledge of a single value. A Merkle proof shows membership in a set, which is much closer to real privacy systems. That makes it a more meaningful step toward anonymous identity and access control.

### Q3: Why did you choose Poseidon instead of SHA256?

A: Because Poseidon is much more circuit-friendly. In zero-knowledge systems, efficiency inside the circuit matters a lot, and Poseidon generally leads to fewer constraints and lower proving cost.

### Q4: What was the hardest part technically?

A: One difficult part was expressing the logic correctly as circuit constraints, especially the left-right ordering in the Merkle path. Another was making sure the witness, proof, public signals, and Solidity verifier inputs all matched exactly. Small mismatches there can break verification even if the circuit itself is fine.

### Q5: What do `pathIndices` do?

A: They indicate whether the current node is on the left or right side at each level of the Merkle path. That matters because `Poseidon(left, right)` is order-sensitive, so the circuit must reconstruct the path with the correct ordering.

### Q6: Why does Solidity verification matter?

A: Because in real applications, proofs often need to be verified by smart contracts. Local verification is good for development, but contract-side verification is what makes the proof usable inside application logic.

### Q7: Did you already deploy this on Polygon?

A: From this repository alone, the strongest claim I can make is that I exported the Solidity verifier and validated it in the Truffle/Ganache contract workflow. If I discuss broader deployment work, I would clearly separate that from what this repository snapshot directly demonstrates.

### Q8: What is the trusted setup risk here?

A: Trusted setup can introduce toxic waste risk if intermediate secrets are mishandled, which could theoretically allow forged proofs. In this demo the setup is local and educational, so I would explicitly say it is not a production-grade trust model.

### Q9: What would you build next?

A: I would extend the Merkle tree design beyond a toy fixed-depth example, represent leaves as commitments instead of raw field elements, and integrate the verifier into a real anonymous messaging or access-control flow.

### Q10: What does this project say about you as an engineer?

A: It shows that I can take a concept that is mathematically abstract and turn it into a working engineering pipeline. I did not stop at understanding zero-knowledge conceptually. I implemented the circuit, proof flow, and contract verification path.

## 9. What I should avoid saying in interviews

I should avoid a few risky claims:

1. I should not say this repository is already a full production anonymous messaging platform.
2. I should not describe zk in vague terms like "it is just more secure and private" without explaining what is being proven.
3. I should not present local Truffle or Ganache testing as if it were a confirmed mainnet deployment.
4. I should not describe the local trusted setup as a production-safe ceremony.

## 10. One-sentence summary

If I had to summarize the project in one sentence, I would say:

This was my zero-knowledge proof foundation project, where I connected Poseidon, Merkle trees, Groth16, and a Solidity verifier into a complete end-to-end workflow for privacy-preserving applications.
