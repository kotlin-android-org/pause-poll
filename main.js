/**
 * @param {number} [ms]
 * @param {Function} [cb]
 * @param {any[]} args
 *
 * @returns {Promise<any>}
 */
export const pause = (ms, cb, ...args) => {
  let timeout

  const promise = new Promise((resolve, reject) => {
    timeout = setTimeout(async () => {
      try {
        resolve(await cb?.(...args))
      } catch (error) {
        reject(error)
      }
    }, ms)
  })

  promise.abort = () => clearTimeout(timeout)

  return promise
}

/**
 * @param {number} [interval]
 * @param {number} [times]
 * @param {Function} [cb]
 * @param {any[]} args
 *
 * @returns {Promise<any>}
 */
export const poll = async (interval, times, cb, ...args) => {
  let result
  const resolve = value => (times = 0) || (result = value)
  const reject = reason => (times = 0) || (result = Promise.reject(reason))

  await (async function basePoll() {
    if (times > 0) {
      const _result = await cb(...args, resolve, reject)

      if (times) {
        result = _result
        --times && (await pause(interval, basePoll))
      }
    }
  })()

  return result
}
