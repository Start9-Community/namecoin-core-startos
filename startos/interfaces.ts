import { namecoinConfFile } from './fileModels/namecoin.conf'
import { sdk } from './sdk'
import {
  peerInterfaceId,
  peerPortExternal,
  peerPortInternal,
  rpcInterfaceId,
  rpcPort,
  zmqInterfaceId,
  zmqPortBlock,
} from './utils'
import { i18n } from './i18n'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  let namecoinConf = await namecoinConfFile.read().const(effects)

  if (!namecoinConf) return []

  // RPC
  const rpcMulti = sdk.MultiHost.of(effects, 'rpc')
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
  const peerMulti = sdk.MultiHost.of(effects, 'peer')
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

  // ZMQ (conditional)
  if (namecoinConf.zmqEnabled) {
    const zmqMulti = sdk.MultiHost.of(effects, 'zmq')
    const zmqMultiOrigin = await zmqMulti.bindPort(zmqPortBlock, {
      preferredExternalPort: zmqPortBlock,
      addSsl: null,
      secure: { ssl: false },
      protocol: null,
    })
    const zmq = sdk.createInterface(effects, {
      name: i18n('ZeroMQ Interface'),
      id: zmqInterfaceId,
      description: i18n(
        'Streams real-time Namecoin block and transaction notifications (hashes and raw data)',
      ),
      type: 'api',
      masked: false,
      schemeOverride: null,
      username: null,
      path: '',
      query: {},
    })
    const zmqReceipt = await zmqMultiOrigin.export([zmq])

    receipts.push(zmqReceipt)
  }

  return receipts
})
