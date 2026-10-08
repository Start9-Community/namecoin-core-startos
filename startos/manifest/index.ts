import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'namecoind',
  title: 'Namecoin Core',
  license: 'MIT',
  donationUrl: 'https://www.namecoin.org/donate/',
  packageRepo: 'https://github.com/Start9-Community/namecoin-core-startos',
  upstreamRepo: 'https://github.com/namecoin/namecoin-core',
  marketingUrl: 'https://www.namecoin.org/',
  description: { short, long },
  volumes: ['main'],
  images: {
    namecoind: {
      source: {
        dockerBuild: {
          buildArgs: {
            VERSION: '31.1',
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
