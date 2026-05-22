import { setupManifest } from '@start9labs/start-sdk'
import { long, short, torDescription } from './i18n'

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
            VERSION: '30.2',
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {
    tor: {
      description: torDescription,
      optional: true,
      metadata: {
        title: 'Tor',
        icon: 'https://raw.githubusercontent.com/Start9Labs/tor-startos/65faea17febc739d910e8c26ff4e61f6333487a8/icon.svg',
      },
    },
  },
})
