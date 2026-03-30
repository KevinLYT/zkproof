pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

// depth: edges from leaf to root (3 => 8 leaves)
template MerkleMembership(depth) {
    signal input leaf;
    signal input pathElements[depth];
    signal input pathIndices[depth];
    signal input root;

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
}

component main { public [ root ] } = MerkleMembership(3);
