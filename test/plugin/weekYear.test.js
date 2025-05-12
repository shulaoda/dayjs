import MockDate from 'mockdate';
import moment from 'moment';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import dayjs, { weekOfYear, weekYear } from '../../dist';

dayjs.extend(weekYear);
dayjs.extend(weekOfYear);

beforeEach(() => {
  MockDate.set(new Date());
});

afterEach(() => {
  MockDate.reset();
});

it('Week Year', () => {
  const daySet = [
    ['2018-12-01', 2018],
    ['2018-12-30', 2019],
    ['2018-12-31', 2019],
    ['2019-01-01', 2019],
  ];
  daySet.forEach((d) => {
    const [day, result] = d;
    const dResult = dayjs(day).weekYear();
    expect(dResult).toBe(result);
    expect(dResult).toBe(moment(day).weekYear());
  });
});
