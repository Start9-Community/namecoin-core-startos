import {
  namecoinConfFile,
  fullConfigSpec,
} from '../../fileModels/namecoin.conf'
import { sdk } from '../../sdk'
import { i18n } from '../../i18n'

export const mempoolConfig = sdk.Action.withInput(
  // id
  'mempool-config',

  // metadata
  async ({ effects }) => ({
    name: i18n('Mempool Settings'),
    description: i18n('Edit the Mempool settings in namecoin.conf'),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),

  // form input specification
  fullConfigSpec.filter({
    persistmempool: true,
    maxmempool: true,
    mempoolexpiry: true,
    permitbaremultisig: true,
    datacarrier: true,
    datacarriersize: true,
    blocksonly: true,
  }),

  // optionally pre-fill the input form
  async ({ effects }) => namecoinConfFile.read().once(),

  // the execution function
  async ({ effects, input }) => namecoinConfFile.merge(effects, input),
)
