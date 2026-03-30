"use strict";

const { execSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
const wasm = path.join(root, "build", "merkle_js", "merkle.wasm");
const input = path.join(root, "input-merkle.json");
const wtns = path.join(root, "build", "merkle_witness.wtns");

execSync(
  `npx --no-install snarkjs wtns calculate "${wasm}" "${input}" "${wtns}"`,
  { stdio: "inherit", cwd: root, shell: true }
);
