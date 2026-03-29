pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

// Private: secret. Public: publicHash. Proves Poseidon(secret) == publicHash.
template HashProof() {
    signal input secret;
    signal input publicHash;

    component hasher = Poseidon(1);
    hasher.inputs[0] <== secret;
    publicHash === hasher.out;
}

component main { public [ publicHash ] } = HashProof();
