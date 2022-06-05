import { ethereum } from "@graphprotocol/graph-ts/chain/ethereum";
import { log } from "@graphprotocol/graph-ts";
import { Transfer, EIP721 } from "../generated/EIP721/EIP721";

import { NFTArbitrage } from "../generated/schema";
//example bots:
//0xbe69dde0a051e72e18871be52cf506e419058f11
//0x9e9346e082d445f08fab1758984a31648c89241a
//0x0d6be5edf91a7a25bf1d9dd14f6c32371bf30ec1

//bugs:
//https://etherscan.io/tx/0x00c4d8c6afc0c106ca3742fda6be02efca7f5e190311224314163cfb509a33be#eventlog

const knownBots = [
  "0xbe69dde0a051e72e18871be52cf506e419058f11",
  "0x9e9346e082d445f08fab1758984a31648c89241a",
  "0x0d6be5edf91a7a25bf1d9dd14f6c32371bf30ec1",
  "0x565b52e14acd804d4e405e2b8c8bcd7f044e9ade",
];
const transferTopic =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const blackListTopics = [
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
];

export function handleTransfer(event: Transfer): void {
  const transactionReceipt = event.receipt;
  const txHash = event.transaction.hash.toHex();
  if (!transactionReceipt) {
    log.error("No transaction receipt found for Transfer event {}", [txHash]);
    return;
  }
  if (!event.transaction.to) {
    return;
  }
  const logs = transactionReceipt.logs;
  const contractAddress = event.transaction.to!.toHexString();
  if (logs.length < 6 || logs.length > 24) {
    if (knownBotCheck(contractAddress)) {
      log.error("EVENT LENGTH {}", [txHash]);
    }
    return;
  }

  const contractCaller = event.transaction.from
    .toHexString()
    .slice(2)
    .toLowerCase();

  let tokenAddress = "";
  let tokenCounter = 0;
  let tokenId = "";
  let erc20TokenTransfer = false;

  for (let logIndex = 0; logIndex < logs.length; logIndex++) {
    const eventLog = logs[logIndex];
    const logAddress = eventLog.address.toHexString();
    const eventSignature = eventLog.topics[0].toHexString();
    const mintable = checkIfMint(eventLog);

    if (
      eventSignature == transferTopic &&
      eventLog.topics.length == 4 &&
      (tokenAddress == "" || logAddress == tokenAddress)
    ) {
      tokenAddress = logAddress;
      tokenId = eventLog.topics[3].toHexString();
      tokenCounter++;
      if (mintable) {
        if (knownBotCheck(contractAddress)) {
          log.error("TOPIC BLACKLIST {}", [txHash]);
        }
        return;
      }
    } else if (eventSignature == transferTopic && eventLog.topics.length == 3) {
      erc20TokenTransfer = true;
    }

    for (
      let topicIndex = 1;
      topicIndex < (eventLog.topics || []).length;
      topicIndex++
    ) {
      const topicValue = eventLog.topics[topicIndex];
      const caller =
        topicValue
          .toHex()
          .toLowerCase()
          .indexOf(contractCaller) != -1;
      if (caller) {
        if (knownBotCheck(contractAddress)) {
          log.error("CALLER BLACKLIST {}", [txHash]);
        }
        return;
      }
    }
  }

  if (!erc20TokenTransfer && (tokenCounter == 0 || tokenCounter > 2)) {
    if (knownBotCheck(contractAddress)) {
      log.error("NO TOKEN BLACKLIST {txHash}", [txHash]);
    }
    return;
  }

  if (!event.transaction.to) {
    if (knownBotCheck(contractAddress)) {
      log.error("No to address found in Transfer event", []);
    }
    return;
  }

  let nftArbitrage = new NFTArbitrage(txHash);
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

const knownBotCheck = (address: string): boolean => {
  return knownBots.indexOf(address) != -1;
};
