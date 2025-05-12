import MockDate from 'mockdate';
import moment from 'moment';
import { afterEach, beforeEach, expect, it } from 'vitest';
import dayjs, { toObject } from '../../dist';

dayjs.extend(toObject);

beforeEach(() => {
  MockDate.set(new Date());
});

afterEach(() => {
  MockDate.reset();
});

it('As Object -> toObject', () => {
  expect(dayjs().toObject()).toEqual(moment().toObject());
});
