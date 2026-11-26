import { namecoinConfFile } from './fileModels/namecoin.conf'
import { sdk } from './sdk'
import {
  peerHostId,
  peerInterfaceId,
  peerPortExternal,
  peerPortInternal,
  peerPortOnion,
  rpcHostId,
  rpcInterfaceId,
  rpcPort,
  zmqHostId,
  zmqPortBlock,
  zmqPortTransaction,
} from './utils'
import { i18n } from './i18n'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const zmqEnabled = await namecoinConfFile
    .read((c) => c.zmqEnabled)
    .const(effects)

  // RPC
  const rpcMulti = sdk.MultiHost.of(effects, rpcHostId)
  const rpcMultiOrigin = await rpcMulti.bindPort(rpcPort, {
    protocol: 'http',
    preferredExternalPort: rpcPort,
  })
  const rpc = sdk.createInterface(effects, {
    name: i18n('RPC Interface'),
    id: rpcInterfaceId,
    description: i18n('Listens for JSON-RPC commands'),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const rpcReceipt = await rpcMultiOrigin.export([rpc])

  const receipts = [rpcReceipt]

  // Peer
  const peerMulti = sdk.MultiHost.of(effects, peerHostId)
  // Onion peers' port. No exported interface: off the LAN, though every service on the bridge reaches it.
  await peerMulti.bindPort(peerPortOnion, {
    protocol: null,
    preferredExternalPort: peerPortOnion,
    addSsl: null,
    secure: { ssl: false },
  })
  const peerMultiOrigin = await peerMulti.bindPort(peerPortInternal, {
    protocol: null,
    preferredExternalPort: peerPortExternal,
    addSsl: null,
    secure: { ssl: false },
  })
  const peer = sdk.createInterface(effects, {
    name: i18n('Peer Interface'),
    id: peerInterfaceId,
    description: i18n(
      'Listens for incoming connections from peers on the namecoin network',
    ),
    type: 'p2p',
    masked: false,
    schemeOverride: { ssl: null, noSsl: null },
    username: null,
    path: '',
    query: {},
  })
  const peerReceipt = await peerMultiOrigin.export([peer])

  receipts.push(peerReceipt)

  // ZMQ (conditional). Bridge-only: the topics are unauthenticated and carry
  // the node's own transactions, so no interface is exported and the ports
  // never reach the LAN. Dependents resolve each port with getBridgeAddress
  // by host id and internal port.
  if (zmqEnabled) {
    const zmqMulti = sdk.MultiHost.of(effects, zmqHostId)
    for (const port of [zmqPortBlock, zmqPortTransaction]) {
      await zmqMulti.bindPort(port, {
        preferredExternalPort: port,
        addSsl: null,
        secure: { ssl: false },
        protocol: null,
      })
    }
  }

  return receipts
})
