import { Duration } from "luxon"
export namespace DurationUtil {
  export const zero = Duration.fromMillis(0)
  export function sum(durs: Duration[]): Duration {
    return durs.reduce((p: Duration, c: Duration) => p.plus(c), zero)
  }
}
