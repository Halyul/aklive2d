import { createCustomEvent } from '@/components/helper'
import { Events as Insight } from '@/components/insight'
import { Events as Player } from '@/components/player'

const RegisterConfig = createCustomEvent('register-config', true)

export default {
    Insight,
    Player,
    RegisterConfig,
}
