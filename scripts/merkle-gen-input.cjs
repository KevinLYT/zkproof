"use strict";

const { buildPoseidon } = require("circomlibjs");
const fs = require("fs");
const path = require("path");

const DEPTH = 3;
const NUM_LEAVES = 1 << DEPTH;

function pairHash(poseidon, F, left, right) {
  const h = poseidon([F.e(left), F.e(right)]);
  return F.toString(h);
}

/** Bottom layer = raw leaves; parents = Poseidon(left, right). */
function buildLevels(leaves, poseidon, F) {
  const levels = [leaves.map((x) => x.toString())];
  let cur = levels[0];
  while (cur.length > 1) {
    const next = [];
    for (let i = 0; i < cur.length; i += 2) {
      next.push(pairHash(poseidon, F, cur[i], cur[i + 1]));
    }
    cur = next;
    levels.push(cur);
  }
  return levels;
}

function pathForLeaf(levels, leafIndex) {
  const pathElements = [];
  const pathIndices = [];
  let idx = leafIndex;
  for (let d = 0; d < DEPTH; d++) {
    const layer = levels[d];
    const siblingIdx = idx ^ 1;
    pathElements.push(layer[siblingIdx]);
    pathIndices.push(String(idx % 2));
    idx = Math.floor(idx / 2);
  }
  return { pathElements, pathIndices };
}

function walkRoot(poseidon, F, leaf, pathElements, pathIndices) {
  let cur = leaf.toString();
  for (let i = 0; i < DEPTH; i++) {
    const sib = pathElements[i];
    const bit = BigInt(pathIndices[i]);
    const left = bit === 0n ? cur : sib;
    const right = bit === 0n ? sib : cur;
    cur = pairHash(poseidon, F, left, right);
  }
  return cur;
}

async function main() {
  const poseidon = await buildPoseidon();
  const F = poseidon.F;

  const leafIndexArg = process.argv[2];
  const leafIndex = leafIndexArg
    ? parseInt(leafIndexArg, 10)
    : 2;

  if (
    !Number.isInteger(leafIndex) ||
    leafIndex < 0 ||
    leafIndex >= NUM_LEAVES
  ) {
    console.error(`leaf index must be in [0, ${NUM_LEAVES - 1}]`);
    process.exit(1);
  }

  const leaves = Array.from({ length: NUM_LEAVES }, (_, i) => BigInt(100 + i));
  const levels = buildLevels(leaves, poseidon, F);
  const root = levels[DEPTH][0];
  const { pathElements, pathIndices } = pathForLeaf(levels, leafIndex);
  const chosenLeaf = leaves[leafIndex].toString();

  const recomputed = walkRoot(
    poseidon,
    F,
    chosenLeaf,
    pathElements,
    pathIndices
  );
  if (recomputed !== root) {
    throw new Error("path/root mismatch (internal bug)");
  }

  const input = {
    leaf: chosenLeaf,
    pathElements,
    pathIndices,
    root,
  };

  const outPath = path.join(__dirname, "..", "input-merkle.json");
  fs.writeFileSync(outPath, JSON.stringify(input, null, 2) + "\n");

  console.log("--- Merkle sample (depth=%s, %s leaves) ---", DEPTH, NUM_LEAVES);
  console.log("leaves (bottom, L->R):", leaves.map((x) => x.toString()).join(", "));
  console.log("chosen leaf index:      ", leafIndex);
  console.log("leaf (private):         ", chosenLeaf);
  console.log("pathElements (siblings):", pathElements.join(", "));
  console.log(
    "pathIndices:            ",
    pathIndices.join(", "),
    "  (0=left slot in Poseidon, 1=right)"
  );
  console.log("root (public):          ", root);
  console.log("Wrote input-merkle.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
