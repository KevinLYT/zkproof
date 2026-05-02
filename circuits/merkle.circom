pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

// depth: edges from leaf to root (3 => 8 leaves)
// Public:
// - root: group root
// - messageHash: binds the proof to the message payload off-chain / on-chain
// - nullifierHash: one-time public tag for replay protection
//
// Private:
// - leaf/pathElements/pathIndices: Merkle membership witness
// - nullifier: secret used to derive the public nullifierHash
template MerkleMessageGate(depth) {
    signal input leaf;
    signal input pathElements[depth];
    signal input pathIndices[depth];
    signal input nullifier;

    signal input root;
    signal input messageHash;
    signal input nullifierHash;

    signal level[depth + 1];
    level[0] <== leaf;

    component h[depth];
    signal left[depth];
    signal right[depth];

    for (var i = 0; i < depth; i++) {
        pathIndices[i] * (pathIndices[i] - 1) === 0;
        // pathIndices[i] = 0 => (leaf side left); 1 => (leaf side right)
        left[i] <== level[i] + pathIndices[i] * (pathElements[i] - level[i]);
        right[i] <== pathElements[i] + pathIndices[i] * (level[i] - pathElements[i]);

        h[i] = Poseidon(2);
        h[i].inputs[0] <== left[i];
        h[i].inputs[1] <== right[i];
        level[i + 1] <== h[i].out;
    }

    root === level[depth];

    // Bind the proof to a specific message while keeping the nullifier secret.
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== nullifier;
    nullifierHasher.inputs[1] <== messageHash;
    nullifierHash === nullifierHasher.out;
}

component main { public [ root, messageHash, nullifierHash ] } = MerkleMessageGate(3);
