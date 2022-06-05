import { ethereum } from "@graphprotocol/graph-ts/chain/ethereum";
import { log } from "@graphprotocol/graph-ts";
import { Transfer, EIP721 } from "../generated/EIP721/EIP721";

import { NFTArbitrage } from "../generated/schema";

const approvalTopic =
"0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925";
const transferTopic =
"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const commonTopicOrder = [
"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
"0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
];

const topicBlackList = [
"0x1bb61a7c0e8fe6922242f2a1fb97851dd40ebfa837ab768260708c3cbc1f8601",
"0x1f72ad2a14447fa756b6f5aca53504645af79813493aca2d906b69e4aaeb9492",
"0x2bad8bc95088af2c247b30fa2b2e6a0886f88625e0945cd3051008e0e270198f",
"0x91b01baeee3a24b590d112613814d86801005c7ef9353e7fc1eaeaf33ccf83b0",
"0xab38cdc4a831ebe6542bf277d36b65dbc5c66a4d03ec6cf56ac38de05dc30098",
"0xbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b",
];

const approveAndTranferTopics = [
"0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
];

//0x0020286ea370ad1868decd4f9a272ed4d5a9d15af64a82ae851eddefeaf9bab4

export function handleTransfer(event: Transfer): void {
const transactionReceipt = event.receipt;
if (!transactionReceipt) {
log.error("No transaction receipt found for Transfer event", []);
return;
}
const logs = transactionReceipt.logs;
if (logs.length < 6 || logs.length > 24) {
return;
}
// log.error("TX {} LOGS {}", [
// event.transaction.hash.toHexString(),
// logs.length.toString(),
// ]);

let contractCaller = event.transaction.from.toHexString().slice(2);
let contractAddress = event.transaction.to!.toHexString().slice(2);

let tokenAddress = " ";
let tokenCounter = 0;
let totalTransfers = 0;
let allSignatures = "";
let erc20TokenTransfer = false;
for (let logIndex = 0; logIndex < logs.length; logIndex++) {
const eventLog = logs[logIndex];
const eventSignature = eventLog.topics[0].toHexString();
const logAddress = eventLog.address.toHexString();
const mintable = checkIfMint(eventLog);
if (mintable || topicBlackList.indexOf(eventSignature) != -1) {
return;
}
if (
eventSignature == approvalTopic &&
eventLog.topics.length == 4 &&
(tokenAddress == "" || logAddress == tokenAddress)
) {
tokenAddress = logAddress;
tokenCounter++;
} else if (eventSignature == transferTopic && eventLog.topics.length == 3) {
erc20TokenTransfer = true;
}

    allSignatures += eventSignature;

    //check for approve and transfer loops
    // if (
    //   approveAndTranferIndex < approveAndTranferTopics.length &&
    //   eventSignature == approveAndTranferTopics[approveAndTranferIndex]
    // ) {
    //   approveAndTranferIndex++;
    //   if (approveAndTranferIndex == 2) {
    //     approveAndTranferIndex = 0;
    //     approveAndTranferTotal++;
    //   }
    // } else if (
    //   eventSignature != approveAndTranferTopics[approveAndTranferIndex]
    // ) {
    //   approveAndTranferIndex = 0;
    // }

    // if (eventSignature == transferTopic && lastTransfer) {
    //   lastTransfer = true;
    //   totalTransfers++;
    // } else if (eventSignature == transferTopic) {
    //   lastTransfer = true;
    // } else {
    //   lastTransfer = false;
    //   totalTransfers = 0;
    // }

}
const topicCount = countSubString(allSignatures, commonTopicOrder.join(""));
const approveAndTranferTotal = countSubString(
allSignatures,
approveAndTranferTopics.join("")
);
if (topicCount > 2 && topicCount < 1) {
if (
event.transaction.hash.toHex() !=
"0x0020286ea370ad1868decd4f9a272ed4d5a9d15af64a82ae851eddefeaf9bab4"
) {
return;
}
log.error("Topic mismatch {}", [topicCount.toString()]);
return;
}
if (approveAndTranferTotal > 3) {
if (
event.transaction.hash.toHex() !=
"0x0020286ea370ad1868decd4f9a272ed4d5a9d15af64a82ae851eddefeaf9bab4"
) {
return;
}
log.error("Approval Transfer total {}, mismatch", [
approveAndTranferTotal.toString(),
]);
return;
}

if (totalTransfers > 2) {
if (
event.transaction.hash.toHex() !=
"0x0020286ea370ad1868decd4f9a272ed4d5a9d15af64a82ae851eddefeaf9bab4"
) {
return;
}
log.error("total transfers to high {}", [totalTransfers.toString()]);
return;
}
if (tokenCounter > 3) {
if (
event.transaction.hash.toHex() !=
"0x0020286ea370ad1868decd4f9a272ed4d5a9d15af64a82ae851eddefeaf9bab4"
) {
return;
}
log.error("Too littke tokens found in Transfer event", []);
return;
}

if (!event.transaction.to) {
if (
event.transaction.hash.toHex() !=
"0x0020286ea370ad1868decd4f9a272ed4d5a9d15af64a82ae851eddefeaf9bab4"
) {
return;
}
log.error("No to address found in Transfer event", []);
return;
}
if (!erc20TokenTransfer) {
return;
}

let nftArbitrage = new NFTArbitrage(event.transaction.hash.toHex());
nftArbitrage.smartContractAddress = event.transaction.to!.toHex();
nftArbitrage.blockNumber = event.block.number.toI32();
nftArbitrage.blockTimestamp = event.block.timestamp.toI32();
nftArbitrage.save();
}

const checkIfMint = (eventLog: ethereum.Log): boolean => {
return (
eventLog.topics.length > 1 &&
eventLog.topics[1].toHexString() &&
eventLog.topics[1]
.toHexString()
.indexOf("0000000000000000000000000000000000000000") != -1
);
};

const countSubString = (inputString: string, subString: string): number => {
return inputString.split(subString).length - 1;
};
