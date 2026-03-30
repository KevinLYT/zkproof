"use strict";

const { execSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
const circuit = path.join(root, "circuits", "merkle.circom");
const outDir = path.join(root, "build");

execSync(`circom "${circuit}" --r1cs --wasm --sym -o "${outDir}"`, {
  stdio: "inherit",
  cwd: root,
  shell: true,
});
