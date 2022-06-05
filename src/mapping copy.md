import { Transfer, EIP721 } from "../generated/EIP721/EIP721";

import { Token } from "../generated/schema";

const approvalTopic =
  "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925";
const order = ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
"pending0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
"pending0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
"pending0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]
export function handleTransfer(event: Transfer): void {
  const transactionReceipt: TransactionReceipt = event.receipt;
  const logs = transactionReceipt.logs;
  let tokenAddress: string = " ";
  let tokenCounter: number = 0
  for (let logIndex = 0; logIndex < logs.length; logIndex++) {
    const log = logs[logIndex];


    if (log.topics[0] === approvalTopic && log.topics.length === 4) {
      if(tokenAddress.length== 1){
        let tokenAddress = log.address}
        else if(tokenAddress !== log.address){
        return null
      }
      else{
        tokenCounter=tokenCounter+1
      }

      for (let lindex = 0; lindex < logTopics.length; lindex++) {
        const lt = logTopics[lindex];
        if(lt==="0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"){
          started = true
        }else{
          prev = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
          if(prev!= sleep)
        }
        ,
   'pending',
   'pending0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
   'pending0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
        
      }

    }} 
    
  }
  if(tokenCounter < 2){
    return null
  }
  let gravatar = new Token(event.params.id.toHex());
  gravatar.owner = event.params.owner;
  gravatar.displayName = event.params.displayName;
  gravatar.imageUrl = event.params.imageUrl;
  gravatar.save();
}
