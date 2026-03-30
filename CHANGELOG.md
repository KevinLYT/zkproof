# 项目变更记录

## 2026-03-28

- 初始化 **Poseidon 哈希知识证明** 演示（Circom + snarkjs + Groth16）。
- 电路：`circuits/hash.circom` — 证明 `Poseidon(secret) == publicHash`。
- 脚本流水线：`npm run compile` → `setup` → `gen-input` → `witness` → `prove` → `verify`（或 `npm run all`）。
- 依赖：`circomlib` / `circomlibjs` / `snarkjs`；需本机安装 Circom。
- 说明：本地 Powers of Tau / zkey 仅作教学演示，非生产可信设置。

## 2026-03-30

- 新增 **Merkle 成员证明**（深度 3、8 叶子），树内节点均为 `Poseidon(2)`，与哈希演示独立一套产物。
- 新电路：`circuits/merkle.circom` — 公开 `root`，私有 `leaf`、`pathElements[3]`、`pathIndices[3]`。
- 新脚本：`scripts/merkle-*.cjs`；`package.json` 中 `merkle:compile` … `merkle:verify` 与 `merkle:all`。
- 输入：`input-merkle.json` 由 `npm run merkle:gen-input` 生成（可选参数：叶子下标 0–7）；脚本会打印 leaves、路径与根。
- 构建产物示例：`build/merkle.r1cs`、`build/merkle_js/`、`build/merkle_final.zkey`、`build/merkle_verification_key.json` 等；`merkle:setup` 在无 `pot12_final.ptau` 时会生成 PTAU，否则复用已有文件。
- **链上验证子项目** `contracts/`：由 `merkle_final.zkey` 导出 `Groth16Verifier.sol`（`snarkjs zkey export solidityverifier`），Truffle 编译/迁移/测试；`test/merkle_verify.test.js` 读取 `build/merkle_proof.json` 与 `merkle_public.json` 调用 `verifyProof`。
