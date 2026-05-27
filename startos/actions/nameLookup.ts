import { sdk } from '../sdk'
import { i18n } from '../i18n'
import { namecoinCliArgs, namecoinMounts } from '../utils'

const { InputSpec, Value } = sdk

/**
 * Name Lookup action.
 *
 * Runs `namecoin-cli name_show <name>` against the running node in a
 * temp SubContainer that shares the package's data volume. Uses cookie
 * auth (no rpcuser/rpcpassword required).
 *
 * Notes:
 *   - `name_show` errors on EXPIRED names unless `-namehistoric=1` is
 *     set at namecoind startup. We surface that error directly to the
 *     user — it is still a signal that the RPC is wired up.
 *   - `name_history` similarly requires `-namehistory=1`. Out of scope
 *     here.
 */
export const inputSpec = InputSpec.of({
  name: Value.text({
    name: i18n('Name to Look Up'),
    description: i18n(
      'A Namecoin name in namespace/name form. Examples: d/wikileaks (domain), id/alice (identity), dd/testls (DNS sub-namespace).',
    ),
    required: true,
    default: 'd/wikileaks',
    patterns: [
      {
        regex: '^[a-z]+/[A-Za-z0-9._-]+$',
        description: i18n(
          'Must be namespace/name (lowercase namespace, alphanumerics/dot/underscore/dash in the name).',
        ),
      },
    ],
  }),
})

export const nameLookup = sdk.Action.withInput(
  // id
  'name-lookup',

  // metadata
  async () => ({
    name: i18n('Name Lookup'),
    description: i18n(
      'Resolve a Namecoin name against the running node and display the JSON result. Equivalent to `namecoin-cli name_show <name>`.',
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),

  // input spec
  inputSpec,

  // optionally pre-fill form
  async () => {},

  // execution function
  async ({ effects, input }) => {
    const name = input.name.trim()

    const result = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'namecoind' },
      namecoinMounts,
      'name-lookup',
      async (subc) =>
        subc.exec([...namecoinCliArgs(), 'name_show', name]),
    )

    const stdout = (result.stdout as string) || ''
    const stderr = (result.stderr as string) || ''
    const exitCode = (result as { exitCode?: number }).exitCode ?? 0

    if (exitCode === 0) {
      return {
        version: '1' as const,
        title: i18n('Name Lookup Result'),
        message: i18n('Found: ${name}', { name }),
        result: {
          type: 'single',
          name: i18n('JSON Result'),
          description: null,
          value: stdout.trim(),
          copyable: true,
          qr: false,
          masked: false,
        },
      }
    }

    // Non-zero exit: surface the error so the user can see *why*
    // (e.g. "name not found", "name expired").
    const errText = stderr.trim() || stdout.trim() || `exit ${exitCode}`
    return {
      version: '1' as const,
      title: i18n('Name Lookup Failed'),
      message: i18n('Lookup of ${name} failed.', { name }),
      result: {
        type: 'single',
        name: i18n('Error'),
        description: null,
        value: errText,
        copyable: true,
        qr: false,
        masked: false,
      },
    }
  },
)
