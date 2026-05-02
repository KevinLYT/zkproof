"use strict";

const Groth16Verifier = artifacts.require("Groth16Verifier");
const MyContract = artifacts.require("MyContract");
const fs = require("fs");
const path = require("path");
const { unstringifyBigInts } = require("ffjavascript").utils;

function proofToSolidityArgs(proof, publicSignals) {
  const p = unstringifyBigInts(proof);
  const pub = unstringifyBigInts(publicSignals);
  const a = [p.pi_a[0].toString(), p.pi_a[1].toString()];
  const b = [
    [p.pi_b[0][1].toString(), p.pi_b[0][0].toString()],
    [p.pi_b[1][1].toString(), p.pi_b[1][0].toString()],
  ];
  const c = [p.pi_c[0].toString(), p.pi_c[1].toString()];
  const input = pub.map((x) => x.toString());
  return { a, b, c, input };
}

contract("ZK message integration", (accounts) => {
  it("verifyProof(merkle_proof.json, merkle_public.json) returns true", async () => {
    const verifier = await Groth16Verifier.deployed();
    const repoRoot = path.join(__dirname, "..", "..");
    const proof = JSON.parse(
      fs.readFileSync(path.join(repoRoot, "build", "merkle_proof.json"), "utf8")
    );
    const pub = JSON.parse(
      fs.readFileSync(path.join(repoRoot, "build", "merkle_public.json"), "utf8")
    );
    const { a, b, c, input } = proofToSolidityArgs(proof, pub);

    const ok = await verifier.verifyProof(a, b, c, input);
    console.log("verifyProof =>", ok);
    assert.strictEqual(ok, true);
  });

  it("sendMessageWithProof stores a message and rejects proof replay", async () => {
    const zkMessage = await MyContract.deployed();
    const repoRoot = path.join(__dirname, "..", "..");
    const proof = JSON.parse(
      fs.readFileSync(path.join(repoRoot, "build", "merkle_proof.json"), "utf8")
    );
    const pub = JSON.parse(
      fs.readFileSync(path.join(repoRoot, "build", "merkle_public.json"), "utf8")
    );
    const { a, b, c, input } = proofToSolidityArgs(proof, pub);
    const content = "gm zk world";
    const to = accounts[1];

    await zkMessage.sendMessageWithProof(to, content, a, b, c, input[2], {
      from: accounts[0],
    });

    const messages = await zkMessage.receiveMessagesContentWithSender(to);
    assert.strictEqual(messages[0][0], content);
    assert.strictEqual(messages[1][0], accounts[0]);

    try {
      await zkMessage.sendMessageWithProof(to, content, a, b, c, input[2], {
        from: accounts[0],
      });
      assert.fail("expected replayed proof to revert");
    } catch (err) {
      assert.include(err.message, "Proof already used");
    }
  });
});
