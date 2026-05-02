# zk proof demo 升级说明

## 2026-05-02 连接 dApp / contract 的更新

这次把项目从单独的 zk proof demo 进一步整理成 `zkproof` proof module，目标是能和新的 zk message dApp 以及本地 message contract 对齐。

新增或明确的点：

1. 项目命名从 `zk-poseidon-demo` 调整为 `zkproof`。
2. Merkle 电路语义对齐 Bruce 修改后的 `zk-message-gate`：公开输入是 `root / messageHash / nullifierHash`，私有输入是 `leaf / pathElements / pathIndices / nullifier`。
3. 合约侧不再只保留 generated verifier；新增 `contracts/contracts/MyContract.sol`，提供 `sendMessageWithProof(...)`。
4. `MyContract` 会在链上重新计算 `messageHash = sha256(content) % FIELD_SIZE`，然后把 `[merkleRoot, messageHash, nullifierHash]` 传给 verifier。
5. 新增 `usedNullifierHashes`，同一个 proof/nullifier 只能使用一次，用来防 replay。
6. Truffle migration 现在会部署 `Groth16Verifier` 后继续部署 `MyContract(verifier, root)`。
7. contract test 从“只验证 proof”升级为“验证 proof -> 发送消息 -> 读取消息 -> 检查 replay 被拒绝”的完整 dApp integration 测试。
8. README 已经改成 `zkproof` 版本，说明和原 NYUSH capstone dApp 的区别、升级点、dApp 连接方式和注意事项。

现在面试/项目展示时可以说：

> 旧版项目完成的是 Merkle membership proof 的密码学闭环；新版把 proof 绑定到 messageHash，并用 nullifierHash 做 replay protection，然后把 verifier 接进消息合约入口，所以它已经从单独 demo 升级成可以服务 dApp 的 zk proof gate。

## 这份文档是干什么的

这份文档用来说明这个项目从“基础 Merkle 成员证明 demo”升级到“可对接消息 dApp 的 proof module”时，核心逻辑发生了什么变化。

重点不是写所有实现细节，而是帮助我自己和之后的面试表达：

1. 之前版本到底做到了哪里。
2. 之后版本为什么要升级。
3. 升级后系统语义发生了什么变化。
4. 旧版我需要讲懂什么，新版当前大致新增了什么。

---

## 一、之前版本是什么样的

之前版本的 Merkle demo，本质上只证明一件事：

> 我知道一个私有 leaf 和一条合法路径，所以这个 leaf 属于某个公开的 Merkle root。

对应电路是：

- [circuits/merkle.circom](/Users/kevinlee/Desktop/Kevin/zk_proof_demo/circuits/merkle.circom:1)

之前版本的公开输入只有：

- `root`

私有输入是：

- `leaf`
- `pathElements`
- `pathIndices`

也就是说，之前版本解决的是：

**成员证明问题。**

它可以证明“我是这个集合里的人”，但它还没有解决消息 dApp 真正需要的两个问题：

1. 这份 proof 到底对应的是哪一条消息。
2. 这份 proof 会不会被别人重复拿来提交。

所以旧版虽然已经是一个完整 zk demo，但它更像：

**一个密码学闭环原型**

而不是一个可以直接接进消息业务入口的 proof module。

---

## 二、之前版本已经完成了什么

旧版并不弱，它其实已经完成了 zk 项目里最难的一条主链路：

1. 写出 Merkle membership 电路。
2. 用脚本自动生成输入。
3. 编译电路。
4. 生成 witness。
5. 生成 Groth16 proof。
6. 在本地验证 proof。
7. 导出 Solidity verifier。
8. 在合约测试里调用 `verifyProof`，确认链上验证也成立。

也就是说，旧版已经完成的是：

`电路 -> proof -> 本地验证 -> Solidity verifier -> 合约侧验证`

这个闭环已经具备了“零知识证明工程原型”的核心价值。

---

## 三、之前版本面试级别需要理解什么

如果我要讲旧版，至少需要真正理解下面这些点。

### 1. zk 在这里到底证明了什么

不是证明“消息内容是对的”，也不是“聊天是加密的”。

旧版证明的是：

**我属于某个由公开 Merkle root 表示的集合。**

### 2. 电路是什么

电路不是物理硬件，而是一组“必须满足的检查规则”。

在旧版 Merkle 电路里，这组规则就是：

- 从私有 `leaf` 出发
- 结合每一层的 `pathElements`
- 根据 `pathIndices` 决定左右顺序
- 一层一层做 `Poseidon(left, right)`
- 最终必须得到公开的 `root`

如果最终算出来的值和 `root` 不一致，这个 proof 就不会成立。

### 3. `pathIndices` 为什么重要

因为哈希左右顺序不能乱。

如果当前节点这一层是在左边，就算 `Poseidon(current, sibling)`；
如果当前节点这一层是在右边，就算 `Poseidon(sibling, current)`。

所以 `pathIndices` 用来告诉电路“这一层该把谁放左边，谁放右边”。

### 4. witness / proof / verifier 分别是什么

- `witness`：系统内部计算 proof 时用的中间结果
- `proof`：最后交给别人验证的证明
- `verifier`：检查 proof 是否成立的验证器

在这个项目里，verifier 不只是本地验证，还有导出的 Solidity verifier，因此链上也能判断 proof 是不是真的有效。

### 5. 为什么用 Poseidon

因为它更适合 zk 电路。

和传统哈希相比，Poseidon 在约束数量和证明成本上更友好，所以更适合在 Circom 里做哈希和 Merkle tree。

### 6. 旧版的边界在哪里

旧版已经能证明 membership，但还没有：

- 绑定到具体消息
- 防止 proof 重放
- 真正作为消息合约入口的一部分使用

这就是它为什么适合作为 zk demo，却还不够作为最终消息系统 proof module 的原因。

---

## 四、为什么要升级

如果我们要把这个 zk demo 接入之前的消息 dApp，那么只证明“我是成员”还不够。

消息 dApp 至少需要再多两层业务语义：

1. 这份 proof 是为这条消息生成的。
2. 这份 proof 不能被重复提交。

否则会有两个问题：

### 问题 1：proof 和消息没有绑定

如果 proof 只和 `root` 有关，那它只能说明“我是成员”，但不能说明“我为这条消息发起了这次证明”。

### 问题 2：proof 可能被重放

如果没有额外的一次性标识，别人拿到一份有效 proof 后，理论上可以重复提交，业务上就会有刷消息或重放的问题。

所以升级的目标不是推翻原来的 Merkle proof，而是：

**在保留成员证明的基础上，把 proof 变成一个真正能服务消息业务的入口凭证。**

---

## 五、之后版本是什么样的

升级后的方向是：

**Merkle membership + message binding + replay protection**

也就是：

1. 还是证明我属于某个公开 `root`
2. 但同时把这次 proof 绑定到一个公开的 `messageHash`
3. 并且通过 `nullifierHash` 为合约侧防重放预留接口

新版公开输入变成：

- `root`
- `messageHash`
- `nullifierHash`

新版私有输入变成：

- `leaf`
- `pathElements`
- `pathIndices`
- `nullifier`

其中最关键的新约束是：

`nullifierHash = Poseidon(nullifier, messageHash)`

这意味着：

- `messageHash` 公开，表示这份 proof 对应哪条消息上下文
- `nullifier` 私有，不直接暴露
- `nullifierHash` 公开，可以给合约记录，后续用于拒绝重复提交

---

## 六、之后版本大致完成了哪些改动

当前这次升级主要完成了下面几件事：

1. 改了 Merkle 电路

旧版只校验 membership。
新版在 membership 基础上新增了 `messageHash` 和 `nullifierHash` 相关约束。

2. 改了输入生成脚本

旧版只生成 Merkle path 相关输入。
新版会同时生成：

- `messageHash`
- `nullifier`
- `nullifierHash`

3. 更新了示例输入

`input-merkle.json` 已经改成新版输入结构，方便后续继续生成 witness / proof。

4. 更新了文档

README 和 CHANGELOG 已同步说明新版 Merkle proof 的定位，不再只是“成员证明 demo”，而是开始向“消息 dApp proof module”靠近。

---

## 七、之后版本目前还没有完全做完什么

这次升级先把 zk 模块本身改到位了，但完整接入消息 dApp 还需要下一步配合：

1. 重新编译电路并生成新的 proof / verification key / zkey
2. 重新导出 Solidity verifier
3. Bruce 那边把新 verifier 接进消息合约
4. 合约里真正记录 `usedNullifier`
5. 前端用 thirdweb 调 `sendMessageWithProof(...)`

也就是说，这一版是：

**先把 zk 核心模块的接口和语义升级到位**

然后再进入 dApp 集成阶段。

---

## 八、如何理解这次升级的幅度

这次改动不算小，但也绝对不是推倒重写。

不变的部分：

- 还是 Circom
- 还是 snarkjs
- 还是 Groth16
- 还是 Poseidon Merkle tree
- 还是本地 prove / verify
- 还是 Solidity verifier 这条路线

新增的部分：

- message binding
- nullifier
- replay protection 的接口预留

所以最准确的说法是：

**底层 zk 路线没有变，变的是它开始承载消息业务语义了。**

---

## 九、我之后面试可以怎么讲这次升级

一个比较自然的表达是：

我一开始先做了一个基础的 Merkle membership zk demo，验证成员证明这条链路能不能从电路一直跑到 Solidity verifier。之后为了把它真正接进匿名消息 dApp，我又把这个 demo 升级成了 message-bound proof：除了证明成员资格之外，proof 还会绑定到当前消息的 `messageHash`，并输出一个 `nullifierHash` 供合约侧做防重放。这一步的意义是把原来的密码学演示，推进成一个可以被业务合约消费的 proof module。

---

## 十、一句话总结

旧版解决的是：

**“我是不是成员。”**

新版开始解决的是：

**“我是成员，而且我这次是在为这条消息提交一个不能随便重放的证明。”**
