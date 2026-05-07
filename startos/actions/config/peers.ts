import { namecoinConfFile, fullConfigSpec } from '../../fileModels/namecoin.conf'
import { sdk } from '../../sdk'

import { i18n } from '../../i18n'

export const peerConfig = sdk.Action.withInput(
  // id
  'peers-config',

  // metadata
  async () => ({
    name: i18n('Peer Settings'),
    description: i18n('Edit the Peer settings in namecoin.conf'),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),

  // form input specification
  fullConfigSpec.filter({
    onlynet: true,
    v2transport: true,
    connectpeer: true,
    maxconnections: true,
  }),

  // optionally pre-fill the input form
  async () => {
    const namecoinConf = await namecoinConfFile.read().once()

    if (!namecoinConf?.raw) return {}

    return { ...namecoinConf }
  },

  // the execution function
  async ({ effects, input }) => {
    await namecoinConfFile.merge(effects, { ...input })
  },
)
