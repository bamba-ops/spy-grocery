// server/api/posthog-test.get.ts
import { useServerPostHog } from '../../../shared/utils/posthog'

export default defineEventHandler(async (event) => {
    const posthog = useServerPostHog()

    posthog.capture({
        distinctId: 'distinct_id_of_the_user',
        event: 'event_name'
    })

    await posthog.shutdown()
})