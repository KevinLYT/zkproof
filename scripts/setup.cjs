"use strict";

const { execSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
const build = path.join(root, "build");
const r1cs = path.join(build, "hash.r1cs");
const ptau0 = path.join(build, "pot12_0000.ptau");
const ptau1 = path.join(build, "pot12_0001.ptau");
const ptauFinal = path.join(build, "pot12_final.ptau");
const zkey0 = path.join(build, "hash_0000.zkey");
const zkey1 = path.join(build, "hash_final.zkey");
const vkey = path.join(build, "verification_key.json");

function run(cmd) {
  execSync(cmd, { stdio: "inherit", cwd: root, shell: true });
}

// Minimal local Powers of Tau (not production-safe).
run(`npx --no-install snarkjs powersoftau new bn128 12 "${ptau0}" -v`);
run(
  `npx --no-install snarkjs powersoftau contribute "${ptau0}" "${ptau1}" --name=local -v -e="demo entropy"`
);
run(`npx --no-install snarkjs powersoftau prepare phase2 "${ptau1}" "${ptauFinal}" -v`);
run(`npx --no-install snarkjs groth16 setup "${r1cs}" "${ptauFinal}" "${zkey0}"`);
run(
  `npx --no-install snarkjs zkey contribute "${zkey0}" "${zkey1}" --name=local -v -e="demo zkey"`
);
run(`npx --no-install snarkjs zkey export verificationkey "${zkey1}" "${vkey}"`);
