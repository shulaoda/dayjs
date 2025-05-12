import MockDate from 'mockdate';
import moment from 'moment';
import { afterEach, beforeEach, expect, it } from 'vitest';
import dayjs, { weekday } from '../../dist';

dayjs.extend(weekday);

beforeEach(() => {
  MockDate.set(new Date());
});

afterEach(() => {
  moment.locale('en');
  dayjs.locale('en');
});

it('Sunday is the first day of the week', () => {
  expect(dayjs().weekday()).toBe(moment().weekday());
  expect(dayjs().weekday(0).date()).toBe(moment().weekday(0).date());
  expect(dayjs().weekday(-7).format()).toBe(moment().weekday(-7).format());
  expect(dayjs().weekday(7).format()).toBe(moment().weekday(7).format());
});
