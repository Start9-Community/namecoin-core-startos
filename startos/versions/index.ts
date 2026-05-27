import { VersionGraph } from '@start9labs/start-sdk'
import { v_30_2_0_3 } from './v30.2.0.3'
import { v_30_2_0_4 } from './v30.2.0.4'

export const versionGraph = VersionGraph.of({
  current: v_30_2_0_4,
  other: [v_30_2_0_3],
})
