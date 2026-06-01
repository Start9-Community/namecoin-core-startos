import { sdk } from '../sdk'
import { autoconfig } from './config/autoconfig'
import { mempoolConfig } from './config/mempool'
import { otherConfig } from './config/other'
import { peerConfig } from './config/peers'
import { rpcConfig } from './config/rpc'
import { configureForElectrumx } from './configureForElectrumx'
import { deleteCoinstatsIndex } from './deleteCoinstatsIndex'
import { deletePeers } from './deletePeers'
import { deleteRpcAuth } from './deleteRpcAuth'
import { deleteTxIndex } from './deleteTxIndex'
import { generateRpcUser } from './generateRpcUser'
import { generateRpcUserDependent } from './generateRpcUserDependent'
import { graduateFromBootstrap } from './graduateFromBootstrap'
import { nameLookup } from './nameLookup'
import { reindexBlockchain } from './reindexBlockchain'
import { reindexChainstate } from './reindexChainstate'
import { runtimeInfo } from './runtimeInfo'
export const actions = sdk.Actions.of()
  .addAction(mempoolConfig)
  .addAction(peerConfig)
  .addAction(rpcConfig)
  .addAction(configureForElectrumx)
  .addAction(deleteCoinstatsIndex)
  .addAction(deletePeers)
  .addAction(deleteRpcAuth)
  .addAction(deleteTxIndex)
  .addAction(generateRpcUser)
  .addAction(generateRpcUserDependent)
  .addAction(graduateFromBootstrap)
  .addAction(nameLookup)
  .addAction(otherConfig)
  .addAction(reindexBlockchain)
  .addAction(reindexChainstate)
  .addAction(runtimeInfo)
  .addAction(autoconfig)
