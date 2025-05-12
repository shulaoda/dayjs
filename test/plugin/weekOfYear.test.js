import MockDate from 'mockdate';
import moment from 'moment';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import dayjs, { advancedFormat, weekOfYear } from '../../dist';

dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);

beforeEach(() => {
  MockDate.set(new Date());
});

afterEach(() => {
  MockDate.reset();
});

it('Week of year', () => {
  dayjs.locale('en');

  const day = '2018-12-31T10:59:09+08:00';
  const week = 27;
  expect(dayjs(day).week()).toBe(moment(day).week());
  expect(dayjs().week()).toBe(moment().week());
  expect(dayjs().week(week).week()).toBe(moment().week(week).week());
  expect(dayjs().weeks(week).week()).toBe(moment().weeks(week).week());
  expect(dayjs().weeks(-week).week()).toBe(moment().weeks(-week).week());
  expect(dayjs().weeks(55).week()).toBe(moment().weeks(55).week());
  expect(dayjs().weeks()).toBe(moment().weeks());
});

describe('Week of year with locale edges', () => {
  const testCases = [
    '2018-12-30',
    '2018-12-31',
    '2019-12-29',
    '2019-12-30',
    '2016-01-01',
    '2016-01-04',
  ];
  testCases.forEach((t) => {
    it(`Edges ${t}`, () => {
      expect(dayjs(t).week())
        .toBe(moment(t).week());
    });
  });
});

it('Format w ww wo', () => {
  const day = '2019-07-28';
  const D = dayjs(day);
  const M = moment(day);
  expect(D.format('w ww wo')).toBe(M.format('w ww wo'));
});
