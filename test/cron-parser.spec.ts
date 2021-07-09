/* eslint-env jest */
import cronParser from 'cron-parser'
import moment from 'moment-timezone'

describe('cron-parser', () => {
  test('UTC', async () => {
    const interval = cronParser.parseExpression('* * * * *', { utc: true })
    const prevTimestamp = interval.prev()._date
    const currentTimestamp = moment.tz(new Date(), 'utc').seconds(0).milliseconds(0)
    expect(currentTimestamp - prevTimestamp).toBe(0)
  })

  test('wrong syntax', () => {
    expect(() => cronParser.parseExpression('fdafsd', { utc: true })).toThrowError()
  })

  test('syntax must have 5 tokens', () => {
    expect('*/2 * * * *'.split(/\s+/).length).toBe(5)
  })

  test('timezone', () => {
    const interval = cronParser.parseExpression('* * * * *', { tz: 'Asia/Shanghai' })
    const prevTimestamp = interval.prev()._date
    const currentTimestamp = moment.tz(new Date(), 'Asia/Shanghai').seconds(0).milliseconds(0)
    expect(currentTimestamp - prevTimestamp).toBe(0)
  })
})
