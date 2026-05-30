import { namecoinConfFile } from '../fileModels/namecoin.conf'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getRpcAuth, getRpcUsers } from './deleteRpcAuth'
const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  username: Value.text({
    name: i18n('Username'),
    description: i18n(
      'RPC username ElectrumX will use to connect to Namecoin Core. Defaults to "electrumx".',
    ),
    required: true,
    default: 'electrumx',
    patterns: [
      {
        regex: '^[a-zA-Z0-9_]+$',
        description: i18n('Must be alphanumeric (can contain underscore).'),
      },
    ],
  }),
})

export const configureForElectrumx = sdk.Action.withInput(
  // id
  'configure-for-electrumx',

  // metadata
  async ({ effects }) => ({
    name: i18n('Configure for ElectrumX'),
    description: i18n(
      'Prepare Namecoin Core to back a local ElectrumX server: generate an RPC user for ElectrumX, disable pruning (prune=0), and enable the transaction index (txindex=true). The generated password is shown once — copy it into ElectrumX immediately. If pruning was previously enabled, a full blockchain reindex will be scheduled on next start.',
    ),
    warning: i18n(
      'Disabling pruning requires a full (non-pruned) chain. If pruning was previously enabled, Namecoin Core will reindex from genesis on next start — this can take hours and needs significantly more disk space (~10–15 GB chain + ~5 GB ElectrumX index).',
    ),
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),

  // input spec
  inputSpec,

  // optionally pre-fill form
  async ({ effects }) => {},

  // execution function
  async ({ effects, input }) => {
    const existingUsernames = await getRpcUsers(effects)

    if (existingUsernames?.includes(input.username)) {
      return {
        version: '1',
        title: i18n('Error creating RPC Auth User'),
        message: i18n('RPCAuth entry with this username already exists.'),
        result: null,
      }
    }

    const mountpoint = '/scripts'

    const res = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'namecoind' },
      sdk.Mounts.of().mountAssets({ subpath: null, mountpoint }),
      'electrumx-rpc-auth-generator',
      (subc) =>
        subc.exec(['python3', `${mountpoint}/rpcauth.py`, `${input.username}`]),
    )

    if (res.exitCode !== 0 || typeof res.stdout !== 'string') {
      return {
        version: '1',
        title: i18n('Failed to create RPC user'),
        message: i18n('rpcauth.py failed with error: ${error}', {
          error: res.stderr as string,
        }),
        result: null,
      }
    }

    const password = res.stdout.split('\n')[3].trim()
    const newRpcAuth = res.stdout.split('\n')[1].trim().split('=')[1].trim()

    const existingRpcAuthEntries = (await getRpcAuth(effects)) || []
    const rpcAuthEntries = [existingRpcAuthEntries].flat()
    rpcAuthEntries.push(newRpcAuth)

    const oldPrune = await namecoinConfFile.read((c) => c.prune).once()

    // ElectrumX needs a full (non-pruned) chain with txindex enabled.
    await namecoinConfFile.merge(effects, {
      raw: { rpcauth: rpcAuthEntries },
      prune: 0,
      txindex: true,
    })

    // If pruning was previously on, schedule a full reindex on next start.
    // Mirrors the behaviour of the "Other Settings" action when prune is
    // turned off.
    await storeJson.merge(effects, {
      reindexBlockchain: !!oldPrune,
    })

    return {
      version: '1',
      title: i18n('Namecoin Core configured for ElectrumX'),
      message: i18n(
        'RPC user "${username}" created, pruning disabled, transaction index enabled. Copy the password below into ElectrumX\'s "Namecoin Core Connection" action. The password is shown ONCE — if lost you will need to create a new RPC user. ${reindexNote}',
        {
          username: input.username,
          reindexNote: !!oldPrune
            ? i18n(
                'Pruning was previously enabled; Namecoin Core will perform a full blockchain reindex on next start.',
              )
            : i18n('No reindex required.'),
        },
      ),
      result: {
        type: 'single',
        value: password,
        copyable: true,
        masked: true,
        qr: false,
      },
    }
  },
)
