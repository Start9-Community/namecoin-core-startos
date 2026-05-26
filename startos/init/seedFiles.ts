import {
  archivalMin,
  namecoinConfFile,
  defaultDbbatchsize,
  defaultDbcache,
  diskUsage,
  minPrune,
} from '../fileModels/namecoin.conf'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (!kind) return

  // install, update, restore
  await storeJson.merge(effects, {})

  if (kind === 'install') {
    await namecoinConfFile.merge(effects, {
      zmqEnabled: true,
      blockfilters: { blockfilterindex: true },
      dbcache: defaultDbcache(),
      dbbatchsize: defaultDbbatchsize(),
      prune: (await diskUsage()).total < archivalMin ? minPrune : 0,
      raw: {
        // Namecoin Core nc30.2 — current best block hash for assumevalid.
        // Update on each release.
      },
    })
  } else {
    await namecoinConfFile.merge(effects, {})
  }
})
