
const MS$1 = "millisecond";

const S$1 = "second";

const MIN$1 = "minute";

const H$1 = "hour";

const D$1 = "day";

const W$1 = "week";

const M$1 = "month";

const Q$1 = "quarter";

const Y$1 = "year";

const DATE$1 = "date";

const REGEX_PARSE$1 = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/;
const REGEX_FORMAT$1 = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g;

const SECONDS_A_MINUTE = 60;
const SECONDS_A_HOUR = SECONDS_A_MINUTE * 60;
const SECONDS_A_DAY = SECONDS_A_HOUR * 24;
const SECONDS_A_WEEK = SECONDS_A_DAY * 7;
const MILLISECONDS_A_SECOND = 1e3;
const MILLISECONDS_A_MINUTE = SECONDS_A_MINUTE * MILLISECONDS_A_SECOND;
const MILLISECONDS_A_HOUR = SECONDS_A_HOUR * MILLISECONDS_A_SECOND;
const MILLISECONDS_A_DAY = SECONDS_A_DAY * MILLISECONDS_A_SECOND;
const MILLISECONDS_A_WEEK = SECONDS_A_WEEK * MILLISECONDS_A_SECOND;
const FORMAT_DEFAULT = "YYYY-MM-DDTHH:mm:ssZ";
const INVALID_DATE_STRING = "Invalid Date";

var en_default = {
	name: "en",
	weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
	months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
	ordinal: (n) => {
		const s = [
			"th",
			"st",
			"nd",
			"rd"
		];
		const v = n % 100;
		return `[${n}${s[(v - 20) % 10] || s[v] || s[0]}]`;
	}
};

const padStart = (string, length, pad) => {
	const s = String(string);
	if (!s || s.length >= length) return string;
	return `${Array(length + 1 - s.length).join(pad)}${string}`;
};
const padZoneStr = (instance) => {
	const negMinutes = -instance.utcOffset();
	const minutes = Math.abs(negMinutes);
	const hourOffset = Math.floor(minutes / 60);
	const minuteOffset = minutes % 60;
	return `${negMinutes <= 0 ? "+" : "-"}${padStart(hourOffset, 2, "0")}:${padStart(minuteOffset, 2, "0")}`;
};
const monthDiff = (a, b) => {
	if (a.date() < b.date()) return -monthDiff(b, a);
	const wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month());
	const anchor = a.clone().add(wholeMonthDiff, M$1);
	const c = b - anchor < 0;
	const anchor2 = a.clone().add(wholeMonthDiff + (c ? -1 : 1), M$1);
	return +(-(wholeMonthDiff + (b - anchor) / (c ? anchor - anchor2 : anchor2 - anchor)) || 0);
};
const absFloor = (n) => n < 0 ? Math.ceil(n) || 0 : Math.floor(n);
const prettyUnit$1 = (u) => {
	const special = {
		M: M$1,
		y: Y$1,
		w: W$1,
		d: D$1,
		D: DATE$1,
		h: H$1,
		m: MIN$1,
		s: S$1,
		ms: MS$1,
		Q: Q$1
	};
	return special[u] || String(u || "").toLowerCase().replace(/s$/, "");
};
const isUndefined = (s) => s === void 0;
var utils_default = {
	s: padStart,
	z: padZoneStr,
	m: monthDiff,
	a: absFloor,
	p: prettyUnit$1,
	u: isUndefined
};

var advancedFormat_default = (o, c) => {
	const proto = c.prototype;
	const oldFormat = proto.format;
	proto.format = function(formatStr) {
		const locale = this.$locale();
		if (!this.isValid()) return oldFormat.bind(this)(formatStr);
		const utils = this.$utils();
		const str = formatStr || FORMAT_DEFAULT;
		const result = str.replace(/\[([^\]]+)]|Q|wo|ww|w|WW|W|zzz|z|gggg|GGGG|Do|X|x|k{1,2}|S/g, (match) => {
			switch (match) {
				case "Q": return Math.ceil((this.$M + 1) / 3);
				case "Do": return locale.ordinal(this.$D);
				case "gggg": return this.weekYear();
				case "GGGG": return this.isoWeekYear();
				case "wo": return locale.ordinal(this.week(), "W");
				case "w":
				case "ww": return utils.s(this.week(), match === "w" ? 1 : 2, "0");
				case "W":
				case "WW": return utils.s(this.isoWeek(), match === "W" ? 1 : 2, "0");
				case "k":
				case "kk": return utils.s(String(this.$H === 0 ? 24 : this.$H), match === "k" ? 1 : 2, "0");
				case "X": return Math.floor(this.$d.getTime() / 1e3);
				case "x": return this.$d.getTime();
				case "z": return `[${this.offsetName()}]`;
				case "zzz": return `[${this.offsetName("long")}]`;
				default: return match;
			}
		});
		return oldFormat.bind(this)(result);
	};
};

var arraySupport_default = (o, c, dayjs) => {
	const proto = c.prototype;
	const parseDate = (cfg) => {
		const { date, utc } = cfg;
		if (Array.isArray(date)) {
			if (utc) {
				if (!date.length) return new Date();
				return new Date(Date.UTC.apply(null, date));
			}
			if (date.length === 1) return dayjs(String(date[0])).toDate();
			return new (Function.prototype.bind.apply(Date, [null].concat(date)))();
		}
		return date;
	};
	const oldParse = proto.parse;
	proto.parse = function(cfg) {
		cfg.date = parseDate.bind(this)(cfg);
		oldParse.bind(this)(cfg);
	};
};

var badMutable_default = (o, c) => {
	const proto = c.prototype;
	proto.$g = function(input, get, set) {
		if (this.$utils().u(input)) return this[get];
		return this.$set(set, input);
	};
	proto.set = function(string, int) {
		return this.$set(string, int);
	};
	const oldStartOf = proto.startOf;
	proto.startOf = function(units, startOf) {
		this.$d = oldStartOf.bind(this)(units, startOf).toDate();
		this.init();
		return this;
	};
	const oldAdd = proto.add;
	proto.add = function(number, units) {
		this.$d = oldAdd.bind(this)(number, units).toDate();
		this.init();
		return this;
	};
	const oldLocale = proto.locale;
	proto.locale = function(preset, object) {
		if (!preset) return this.$L;
		this.$L = oldLocale.bind(this)(preset, object).$L;
		return this;
	};
	const oldDaysInMonth = proto.daysInMonth;
	proto.daysInMonth = function() {
		return oldDaysInMonth.bind(this.clone())();
	};
	const oldIsSame = proto.isSame;
	proto.isSame = function(that, units) {
		return oldIsSame.bind(this.clone())(that, units);
	};
	const oldIsBefore = proto.isBefore;
	proto.isBefore = function(that, units) {
		return oldIsBefore.bind(this.clone())(that, units);
	};
	const oldIsAfter = proto.isAfter;
	proto.isAfter = function(that, units) {
		return oldIsAfter.bind(this.clone())(that, units);
	};
};

const isBigInt = (num) => typeof num === "bigint";
var bigIntSupport_default = (o, c, dayjs) => {
	const proto = c.prototype;
	const parseDate = (cfg) => {
		const { date } = cfg;
		if (isBigInt(date)) return Number(date);
		return date;
	};
	const oldParse = proto.parse;
	proto.parse = function(cfg) {
		cfg.date = parseDate.bind(this)(cfg);
		oldParse.bind(this)(cfg);
	};
	const oldUnix = dayjs.unix;
	dayjs.unix = function(timestamp) {
		const ts = isBigInt(timestamp) ? Number(timestamp) : timestamp;
		return oldUnix(ts);
	};
};

var buddhistEra_default = (o, c) => {
	const proto = c.prototype;
	const oldFormat = proto.format;
	proto.format = function(formatStr) {
		const yearBias = 543;
		const str = formatStr || FORMAT_DEFAULT;
		const result = str.replace(/(\[[^\]]+])|BBBB|BB/g, (match, a) => {
			const year = String(this.$y + yearBias);
			const args = match === "BB" ? [year.slice(-2), 2] : [year, 4];
			return a || this.$utils().s(...args, "0");
		});
		return oldFormat.bind(this)(result);
	};
};

var calendar_default = (o, c, d) => {
	const LT = "h:mm A";
	const L = "MM/DD/YYYY";
	const calendarFormat = {
		lastDay: `[Yesterday at] ${LT}`,
		sameDay: `[Today at] ${LT}`,
		nextDay: `[Tomorrow at] ${LT}`,
		nextWeek: `dddd [at] ${LT}`,
		lastWeek: `[Last] dddd [at] ${LT}`,
		sameElse: L
	};
	const proto = c.prototype;
	proto.calendar = function(referenceTime, formats) {
		const format = formats || this.$locale().calendar || calendarFormat;
		const referenceStartOfDay = d(referenceTime || void 0).startOf("d");
		const diff = this.diff(referenceStartOfDay, "d", true);
		const sameElse = "sameElse";
		const retVal = diff < -6 ? sameElse : diff < -1 ? "lastWeek" : diff < 0 ? "lastDay" : diff < 1 ? "sameDay" : diff < 2 ? "nextDay" : diff < 7 ? "nextWeek" : sameElse;
		const currentFormat = format[retVal] || calendarFormat[retVal];
		if (typeof currentFormat === "function") return currentFormat.call(this, d());
		return this.format(currentFormat);
	};
};

const t = (format) => format.replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g, (_, a, b) => a || b.slice(1));
const englishFormats = {
	LTS: "h:mm:ss A",
	LT: "h:mm A",
	L: "MM/DD/YYYY",
	LL: "MMMM D, YYYY",
	LLL: "MMMM D, YYYY h:mm A",
	LLLL: "dddd, MMMM D, YYYY h:mm A"
};
const u = (formatStr, formats) => formatStr.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g, (_, a, b) => {
	const B = b && b.toUpperCase();
	return a || formats[b] || englishFormats[b] || t(formats[B]);
});

const formattingTokens = /(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g;
const match1 = /\d/;
const match2 = /\d\d/;
const match3 = /\d{3}/;
const match4 = /\d{4}/;
const match1to2 = /\d\d?/;
const matchSigned = /[+-]?\d+/;
const matchOffset = /[+-]\d\d:?(\d\d)?|Z/;
const matchWord = /\d*[^-_:/,()\s\d]+/;
let locale$1 = {};
let parseTwoDigitYear = function(input) {
	input = +input;
	return input + (input > 68 ? 1900 : 2e3);
};
function offsetFromString$1(string) {
	if (!string) return 0;
	if (string === "Z") return 0;
	const parts = string.match(/([+-]|\d\d)/g);
	const minutes = +(parts[1] * 60) + (+parts[2] || 0);
	return minutes === 0 ? 0 : parts[0] === "+" ? -minutes : minutes;
}
const addInput = function(property) {
	return function(input) {
		this[property] = +input;
	};
};
const zoneExpressions = [matchOffset, function(input) {
	const zone = this.zone || (this.zone = {});
	zone.offset = offsetFromString$1(input);
}];
const getLocalePart = (name) => {
	const part = locale$1[name];
	return part && (part.indexOf ? part : part.s.concat(part.f));
};
const meridiemMatch = (input, isLowerCase) => {
	let isAfternoon;
	const { meridiem } = locale$1;
	if (!meridiem) isAfternoon = input === (isLowerCase ? "pm" : "PM");
	else for (let i = 1; i <= 24; i += 1) if (input.indexOf(meridiem(i, 0, isLowerCase)) > -1) {
		isAfternoon = i > 12;
		break;
	}
	return isAfternoon;
};
const expressions = {
	A: [matchWord, function(input) {
		this.afternoon = meridiemMatch(input, false);
	}],
	a: [matchWord, function(input) {
		this.afternoon = meridiemMatch(input, true);
	}],
	Q: [match1, function(input) {
		this.month = (input - 1) * 3 + 1;
	}],
	S: [match1, function(input) {
		this.milliseconds = +input * 100;
	}],
	SS: [match2, function(input) {
		this.milliseconds = +input * 10;
	}],
	SSS: [match3, function(input) {
		this.milliseconds = +input;
	}],
	s: [match1to2, addInput("seconds")],
	ss: [match1to2, addInput("seconds")],
	m: [match1to2, addInput("minutes")],
	mm: [match1to2, addInput("minutes")],
	H: [match1to2, addInput("hours")],
	h: [match1to2, addInput("hours")],
	HH: [match1to2, addInput("hours")],
	hh: [match1to2, addInput("hours")],
	D: [match1to2, addInput("day")],
	DD: [match2, addInput("day")],
	Do: [matchWord, function(input) {
		const { ordinal } = locale$1;
		[this.day] = input.match(/\d+/);
		if (!ordinal) return;
		for (let i = 1; i <= 31; i += 1) if (ordinal(i).replace(/\[|\]/g, "") === input) this.day = i;
	}],
	w: [match1to2, addInput("week")],
	ww: [match2, addInput("week")],
	M: [match1to2, addInput("month")],
	MM: [match2, addInput("month")],
	MMM: [matchWord, function(input) {
		const months = getLocalePart("months");
		const monthsShort = getLocalePart("monthsShort");
		const matchIndex = (monthsShort || months.map((_) => _.slice(0, 3))).indexOf(input) + 1;
		if (matchIndex < 1) throw new Error();
		this.month = matchIndex % 12 || matchIndex;
	}],
	MMMM: [matchWord, function(input) {
		const months = getLocalePart("months");
		const matchIndex = months.indexOf(input) + 1;
		if (matchIndex < 1) throw new Error();
		this.month = matchIndex % 12 || matchIndex;
	}],
	Y: [matchSigned, addInput("year")],
	YY: [match2, function(input) {
		this.year = parseTwoDigitYear(input);
	}],
	YYYY: [match4, addInput("year")],
	Z: zoneExpressions,
	ZZ: zoneExpressions
};
function correctHours(time) {
	const { afternoon } = time;
	if (afternoon !== void 0) {
		const { hours } = time;
		if (afternoon) {
			if (hours < 12) time.hours += 12;
		} else if (hours === 12) time.hours = 0;
		delete time.afternoon;
	}
}
function makeParser(format) {
	format = u(format, locale$1 && locale$1.formats);
	const array = format.match(formattingTokens);
	const { length } = array;
	for (let i = 0; i < length; i += 1) {
		const token = array[i];
		const parseTo = expressions[token];
		const regex = parseTo && parseTo[0];
		const parser = parseTo && parseTo[1];
		if (parser) array[i] = {
			regex,
			parser
		};
		else array[i] = token.replace(/^\[|\]$/g, "");
	}
	return function(input) {
		const time = {};
		for (let i = 0, start = 0; i < length; i += 1) {
			const token = array[i];
			if (typeof token === "string") start += token.length;
			else {
				const { regex, parser } = token;
				const part = input.slice(start);
				const match = regex.exec(part);
				const value = match[0];
				parser.call(time, value);
				input = input.replace(value, "");
			}
		}
		correctHours(time);
		return time;
	};
}
const parseFormattedInput = (input, format, utc, dayjs) => {
	try {
		if (["x", "X"].indexOf(format) > -1) return new Date((format === "X" ? 1e3 : 1) * input);
		const parser = makeParser(format);
		const { year, month, day, hours, minutes, seconds, milliseconds, zone, week } = parser(input);
		const now = new Date();
		const d = day || (!year && !month ? now.getDate() : 1);
		const y = year || now.getFullYear();
		let M = 0;
		if (!(year && !month)) M = month > 0 ? month - 1 : now.getMonth();
		const h = hours || 0;
		const m = minutes || 0;
		const s = seconds || 0;
		const ms = milliseconds || 0;
		if (zone) return new Date(Date.UTC(y, M, d, h, m, s, ms + zone.offset * 60 * 1e3));
		if (utc) return new Date(Date.UTC(y, M, d, h, m, s, ms));
		let newDate;
		newDate = new Date(y, M, d, h, m, s, ms);
		if (week) newDate = dayjs(newDate).week(week).toDate();
		return newDate;
	} catch (e) {
		return new Date("");
	}
};
var customParseFormat_default = (o, C, d) => {
	d.p.customParseFormat = true;
	if (o && o.parseTwoDigitYear) ({parseTwoDigitYear} = o);
	const proto = C.prototype;
	const oldParse = proto.parse;
	proto.parse = function(cfg) {
		const { date, utc, args } = cfg;
		this.$u = utc;
		const format = args[1];
		if (typeof format === "string") {
			const isStrictWithoutLocale = args[2] === true;
			const isStrictWithLocale = args[3] === true;
			const isStrict = isStrictWithoutLocale || isStrictWithLocale;
			let pl = args[2];
			if (isStrictWithLocale) [, , pl] = args;
			locale$1 = this.$locale();
			if (!isStrictWithoutLocale && pl) locale$1 = d.Ls[pl];
			this.$d = parseFormattedInput(date, format, utc, d);
			this.init();
			if (pl && pl !== true) this.$L = this.locale(pl).$L;
			if (isStrict && date != this.format(format)) this.$d = new Date("");
			locale$1 = {};
		} else if (format instanceof Array) {
			const len = format.length;
			for (let i = 1; i <= len; i += 1) {
				args[1] = format[i - 1];
				const result = d.apply(this, args);
				if (result.isValid()) {
					this.$d = result.$d;
					this.$L = result.$L;
					this.init();
					break;
				}
				if (i === len) this.$d = new Date("");
			}
		} else oldParse.call(this, cfg);
	};
};

var dayOfYear_default = (o, c, d) => {
	const proto = c.prototype;
	proto.dayOfYear = function(input) {
		const dayOfYear = Math.round((d(this).startOf("day") - d(this).startOf("year")) / 864e5) + 1;
		return input == null ? dayOfYear : this.add(input - dayOfYear, "day");
	};
};

var devHelper_default = (o, c, d) => {
	/* istanbul ignore next line */
	if (!process || process.env.NODE_ENV !== "production") {
		const proto = c.prototype;
		const oldParse = proto.parse;
		proto.parse = function(cfg) {
			const { date } = cfg;
			if (typeof date === "string" && date.length === 13) console.warn(`To parse a Unix timestamp like ${date}, you should pass it as a Number. https://day.js.org/docs/en/parse/unix-timestamp-milliseconds`);
			if (typeof date === "number" && String(date).length === 4) console.warn(`Guessing you may want to parse the Year ${date}, you should pass it as a String ${date}, not a Number. Otherwise, ${date} will be treated as a Unix timestamp`);
			if (cfg.args.length >= 2 && !d.p.customParseFormat) console.warn(`To parse a date-time string like ${date} using the given format, you should enable customParseFormat plugin first. https://day.js.org/docs/en/parse/string-format`);
			return oldParse.bind(this)(cfg);
		};
		const oldLocale = d.locale;
		d.locale = function(preset, object, isLocal) {
			if (typeof object === "undefined" && typeof preset === "string") {
				if (!d.Ls[preset]) console.warn(`Guessing you may want to use locale ${preset}, you have to load it before using it. https://day.js.org/docs/en/i18n/loading-into-nodejs`);
			}
			return oldLocale(preset, object, isLocal);
		};
	}
};

const MILLISECONDS_A_YEAR = MILLISECONDS_A_DAY * 365;
const MILLISECONDS_A_MONTH = MILLISECONDS_A_YEAR / 12;
const durationRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;
const unitToMS = {
	years: MILLISECONDS_A_YEAR,
	months: MILLISECONDS_A_MONTH,
	days: MILLISECONDS_A_DAY,
	hours: MILLISECONDS_A_HOUR,
	minutes: MILLISECONDS_A_MINUTE,
	seconds: MILLISECONDS_A_SECOND,
	milliseconds: 1,
	weeks: MILLISECONDS_A_WEEK
};
const isDuration = (d) => d instanceof Duration;
let $d$1;
let $u;
const wrapper$1 = (input, instance, unit) => new Duration(input, unit, instance.$l);
const prettyUnit = (unit) => `${$u.p(unit)}s`;
const isNegative = (number) => number < 0;
const roundNumber = (number) => isNegative(number) ? Math.ceil(number) : Math.floor(number);
const absolute = (number) => Math.abs(number);
const getNumberUnitFormat = (number, unit) => {
	if (!number) return {
		negative: false,
		format: ""
	};
	if (isNegative(number)) return {
		negative: true,
		format: `${absolute(number)}${unit}`
	};
	return {
		negative: false,
		format: `${number}${unit}`
	};
};
class Duration {
	constructor(input, unit, locale) {
		this.$d = {};
		this.$l = locale;
		if (input === void 0) {
			this.$ms = 0;
			this.parseFromMilliseconds();
		}
		if (unit) return wrapper$1(input * unitToMS[prettyUnit(unit)], this);
		if (typeof input === "number") {
			this.$ms = input;
			this.parseFromMilliseconds();
			return this;
		}
		if (typeof input === "object") {
			Object.keys(input).forEach((k) => {
				this.$d[prettyUnit(k)] = input[k];
			});
			this.calMilliseconds();
			return this;
		}
		if (typeof input === "string") {
			const d = input.match(durationRegex);
			if (d) {
				const properties = d.slice(2);
				const numberD = properties.map((value) => value != null ? Number(value) : 0);
				[this.$d.years, this.$d.months, this.$d.weeks, this.$d.days, this.$d.hours, this.$d.minutes, this.$d.seconds] = numberD;
				this.calMilliseconds();
				return this;
			}
		}
		return this;
	}
	calMilliseconds() {
		this.$ms = Object.keys(this.$d).reduce((total, unit) => total + (this.$d[unit] || 0) * unitToMS[unit], 0);
	}
	parseFromMilliseconds() {
		let { $ms } = this;
		this.$d.years = roundNumber($ms / MILLISECONDS_A_YEAR);
		$ms %= MILLISECONDS_A_YEAR;
		this.$d.months = roundNumber($ms / MILLISECONDS_A_MONTH);
		$ms %= MILLISECONDS_A_MONTH;
		this.$d.days = roundNumber($ms / MILLISECONDS_A_DAY);
		$ms %= MILLISECONDS_A_DAY;
		this.$d.hours = roundNumber($ms / MILLISECONDS_A_HOUR);
		$ms %= MILLISECONDS_A_HOUR;
		this.$d.minutes = roundNumber($ms / MILLISECONDS_A_MINUTE);
		$ms %= MILLISECONDS_A_MINUTE;
		this.$d.seconds = roundNumber($ms / MILLISECONDS_A_SECOND);
		$ms %= MILLISECONDS_A_SECOND;
		this.$d.milliseconds = $ms;
	}
	toISOString() {
		const Y = getNumberUnitFormat(this.$d.years, "Y");
		const M = getNumberUnitFormat(this.$d.months, "M");
		let days = +this.$d.days || 0;
		if (this.$d.weeks) days += this.$d.weeks * 7;
		const D = getNumberUnitFormat(days, "D");
		const H = getNumberUnitFormat(this.$d.hours, "H");
		const m = getNumberUnitFormat(this.$d.minutes, "M");
		let seconds = this.$d.seconds || 0;
		if (this.$d.milliseconds) {
			seconds += this.$d.milliseconds / 1e3;
			seconds = Math.round(seconds * 1e3) / 1e3;
		}
		const S = getNumberUnitFormat(seconds, "S");
		const negativeMode = Y.negative || M.negative || D.negative || H.negative || m.negative || S.negative;
		const T = H.format || m.format || S.format ? "T" : "";
		const P = negativeMode ? "-" : "";
		const result = `${P}P${Y.format}${M.format}${D.format}${T}${H.format}${m.format}${S.format}`;
		return result === "P" || result === "-P" ? "P0D" : result;
	}
	toJSON() {
		return this.toISOString();
	}
	format(formatStr) {
		const str = formatStr || "YYYY-MM-DDTHH:mm:ss";
		const matches = {
			Y: this.$d.years,
			YY: $u.s(this.$d.years, 2, "0"),
			YYYY: $u.s(this.$d.years, 4, "0"),
			M: this.$d.months,
			MM: $u.s(this.$d.months, 2, "0"),
			D: this.$d.days,
			DD: $u.s(this.$d.days, 2, "0"),
			H: this.$d.hours,
			HH: $u.s(this.$d.hours, 2, "0"),
			m: this.$d.minutes,
			mm: $u.s(this.$d.minutes, 2, "0"),
			s: this.$d.seconds,
			ss: $u.s(this.$d.seconds, 2, "0"),
			SSS: $u.s(this.$d.milliseconds, 3, "0")
		};
		return str.replace(REGEX_FORMAT$1, (match, $1) => $1 || String(matches[match]));
	}
	as(unit) {
		return this.$ms / unitToMS[prettyUnit(unit)];
	}
	get(unit) {
		let base = this.$ms;
		const pUnit = prettyUnit(unit);
		if (pUnit === "milliseconds") base %= 1e3;
		else if (pUnit === "weeks") base = roundNumber(base / unitToMS[pUnit]);
		else base = this.$d[pUnit];
		return base || 0;
	}
	add(input, unit, isSubtract) {
		let another;
		if (unit) another = input * unitToMS[prettyUnit(unit)];
		else if (isDuration(input)) another = input.$ms;
		else another = wrapper$1(input, this).$ms;
		return wrapper$1(this.$ms + another * (isSubtract ? -1 : 1), this);
	}
	subtract(input, unit) {
		return this.add(input, unit, true);
	}
	locale(l) {
		const that = this.clone();
		that.$l = l;
		return that;
	}
	clone() {
		return wrapper$1(this.$ms, this);
	}
	humanize(withSuffix) {
		return $d$1().add(this.$ms, "ms").locale(this.$l).fromNow(!withSuffix);
	}
	valueOf() {
		return this.asMilliseconds();
	}
	milliseconds() {
		return this.get("milliseconds");
	}
	asMilliseconds() {
		return this.as("milliseconds");
	}
	seconds() {
		return this.get("seconds");
	}
	asSeconds() {
		return this.as("seconds");
	}
	minutes() {
		return this.get("minutes");
	}
	asMinutes() {
		return this.as("minutes");
	}
	hours() {
		return this.get("hours");
	}
	asHours() {
		return this.as("hours");
	}
	days() {
		return this.get("days");
	}
	asDays() {
		return this.as("days");
	}
	weeks() {
		return this.get("weeks");
	}
	asWeeks() {
		return this.as("weeks");
	}
	months() {
		return this.get("months");
	}
	asMonths() {
		return this.as("months");
	}
	years() {
		return this.get("years");
	}
	asYears() {
		return this.as("years");
	}
}
const manipulateDuration = (date, duration, k) => date.add(duration.years() * k, "y").add(duration.months() * k, "M").add(duration.days() * k, "d").add(duration.hours() * k, "h").add(duration.minutes() * k, "m").add(duration.seconds() * k, "s").add(duration.milliseconds() * k, "ms");
var duration_default = (option, Dayjs, dayjs) => {
	$d$1 = dayjs;
	$u = dayjs().$utils();
	dayjs.duration = function(input, unit) {
		const $l = dayjs.locale();
		return wrapper$1(input, { $l }, unit);
	};
	dayjs.isDuration = isDuration;
	const oldAdd = Dayjs.prototype.add;
	const oldSubtract = Dayjs.prototype.subtract;
	Dayjs.prototype.add = function(value, unit) {
		if (isDuration(value)) return manipulateDuration(this, value, 1);
		return oldAdd.bind(this)(value, unit);
	};
	Dayjs.prototype.subtract = function(value, unit) {
		if (isDuration(value)) return manipulateDuration(this, value, -1);
		return oldSubtract.bind(this)(value, unit);
	};
};

var isBetween_default = (o, c, d) => {
	c.prototype.isBetween = function(a, b, u, i) {
		const dA = d(a);
		const dB = d(b);
		i = i || "()";
		const dAi = i[0] === "(";
		const dBi = i[1] === ")";
		return (dAi ? this.isAfter(dA, u) : !this.isBefore(dA, u)) && (dBi ? this.isBefore(dB, u) : !this.isAfter(dB, u)) || (dAi ? this.isBefore(dA, u) : !this.isAfter(dA, u)) && (dBi ? this.isAfter(dB, u) : !this.isBefore(dB, u));
	};
};

var isLeapYear_default = (o, c) => {
	const proto = c.prototype;
	proto.isLeapYear = function() {
		return this.$y % 4 === 0 && this.$y % 100 !== 0 || this.$y % 400 === 0;
	};
};

var isMoment_default = (o, c, f) => {
	f.isMoment = function(input) {
		return f.isDayjs(input);
	};
};

const isoWeekPrettyUnit = "isoweek";
var isoWeek_default = (o, c, d) => {
	const getYearFirstThursday = (year, isUtc) => {
		const yearFirstDay = (isUtc ? d.utc : d)().year(year).startOf(Y$1);
		let addDiffDays = 4 - yearFirstDay.isoWeekday();
		if (yearFirstDay.isoWeekday() > 4) addDiffDays += 7;
		return yearFirstDay.add(addDiffDays, D$1);
	};
	const getCurrentWeekThursday = (ins) => ins.add(4 - ins.isoWeekday(), D$1);
	const proto = c.prototype;
	proto.isoWeekYear = function() {
		const nowWeekThursday = getCurrentWeekThursday(this);
		return nowWeekThursday.year();
	};
	proto.isoWeek = function(week) {
		if (!this.$utils().u(week)) return this.add((week - this.isoWeek()) * 7, D$1);
		const nowWeekThursday = getCurrentWeekThursday(this);
		const diffWeekThursday = getYearFirstThursday(this.isoWeekYear(), this.$u);
		return nowWeekThursday.diff(diffWeekThursday, W$1) + 1;
	};
	proto.isoWeekday = function(week) {
		if (!this.$utils().u(week)) return this.day(this.day() % 7 ? week : week - 7);
		return this.day() || 7;
	};
	const oldStartOf = proto.startOf;
	proto.startOf = function(units, startOf) {
		const utils = this.$utils();
		const isStartOf = !utils.u(startOf) ? startOf : true;
		const unit = utils.p(units);
		if (unit === isoWeekPrettyUnit) return isStartOf ? this.date(this.date() - (this.isoWeekday() - 1)).startOf("day") : this.date(this.date() - 1 - (this.isoWeekday() - 1) + 7).endOf("day");
		return oldStartOf.bind(this)(units, startOf);
	};
};

var isoWeeksInYear_default = (o, c) => {
	const proto = c.prototype;
	proto.isoWeeksInYear = function() {
		const isLeapYear = this.isLeapYear();
		const last = this.endOf("y");
		const day = last.day();
		if (day === 4 || isLeapYear && day === 5) return 53;
		return 52;
	};
};

var isSameOrAfter_default = (o, c) => {
	c.prototype.isSameOrAfter = function(that, units) {
		return this.isSame(that, units) || this.isAfter(that, units);
	};
};

var isSameOrBefore_default = (o, c) => {
	c.prototype.isSameOrBefore = function(that, units) {
		return this.isSame(that, units) || this.isBefore(that, units);
	};
};

var isToday_default = (o, c, d) => {
	const proto = c.prototype;
	proto.isToday = function() {
		const comparisonTemplate = "YYYY-MM-DD";
		const now = d();
		return this.format(comparisonTemplate) === now.format(comparisonTemplate);
	};
};

var isTomorrow_default = (o, c, d) => {
	const proto = c.prototype;
	proto.isTomorrow = function() {
		const comparisonTemplate = "YYYY-MM-DD";
		const tomorrow = d().add(1, "day");
		return this.format(comparisonTemplate) === tomorrow.format(comparisonTemplate);
	};
};

var isYesterday_default = (o, c, d) => {
	const proto = c.prototype;
	proto.isYesterday = function() {
		const comparisonTemplate = "YYYY-MM-DD";
		const yesterday = d().subtract(1, "day");
		return this.format(comparisonTemplate) === yesterday.format(comparisonTemplate);
	};
};

var localeData_default = (o, c, dayjs) => {
	const proto = c.prototype;
	const getLocalePart = (part) => part && (part.indexOf ? part : part.s);
	const getShort = (ins, target, full, num, localeOrder) => {
		const locale = ins.name ? ins : ins.$locale();
		const targetLocale = getLocalePart(locale[target]);
		const fullLocale = getLocalePart(locale[full]);
		const result = targetLocale || fullLocale.map((f) => f.slice(0, num));
		if (!localeOrder) return result;
		const { weekStart } = locale;
		return result.map((_, index) => result[(index + (weekStart || 0)) % 7]);
	};
	const getDayjsLocaleObject = () => dayjs.Ls[dayjs.locale()];
	const getLongDateFormat = (l, format) => l.formats[format] || t(l.formats[format.toUpperCase()]);
	const localeData = function() {
		return {
			months: (instance) => instance ? instance.format("MMMM") : getShort(this, "months"),
			monthsShort: (instance) => instance ? instance.format("MMM") : getShort(this, "monthsShort", "months", 3),
			firstDayOfWeek: () => this.$locale().weekStart || 0,
			weekdays: (instance) => instance ? instance.format("dddd") : getShort(this, "weekdays"),
			weekdaysMin: (instance) => instance ? instance.format("dd") : getShort(this, "weekdaysMin", "weekdays", 2),
			weekdaysShort: (instance) => instance ? instance.format("ddd") : getShort(this, "weekdaysShort", "weekdays", 3),
			longDateFormat: (format) => getLongDateFormat(this.$locale(), format),
			meridiem: this.$locale().meridiem,
			ordinal: this.$locale().ordinal
		};
	};
	proto.localeData = function() {
		return localeData.bind(this)();
	};
	dayjs.localeData = () => {
		const localeObject = getDayjsLocaleObject();
		return {
			firstDayOfWeek: () => localeObject.weekStart || 0,
			weekdays: () => dayjs.weekdays(),
			weekdaysShort: () => dayjs.weekdaysShort(),
			weekdaysMin: () => dayjs.weekdaysMin(),
			months: () => dayjs.months(),
			monthsShort: () => dayjs.monthsShort(),
			longDateFormat: (format) => getLongDateFormat(localeObject, format),
			meridiem: localeObject.meridiem,
			ordinal: localeObject.ordinal
		};
	};
	dayjs.months = () => getShort(getDayjsLocaleObject(), "months");
	dayjs.monthsShort = () => getShort(getDayjsLocaleObject(), "monthsShort", "months", 3);
	dayjs.weekdays = (localeOrder) => getShort(getDayjsLocaleObject(), "weekdays", null, null, localeOrder);
	dayjs.weekdaysShort = (localeOrder) => getShort(getDayjsLocaleObject(), "weekdaysShort", "weekdays", 3, localeOrder);
	dayjs.weekdaysMin = (localeOrder) => getShort(getDayjsLocaleObject(), "weekdaysMin", "weekdays", 2, localeOrder);
};

var localizedFormat_default = (o, c, d) => {
	const proto = c.prototype;
	const oldFormat = proto.format;
	d.en.formats = englishFormats;
	proto.format = function(formatStr = FORMAT_DEFAULT) {
		const { formats = {} } = this.$locale();
		const result = u(formatStr, formats);
		return oldFormat.call(this, result);
	};
};

var minMax_default = (o, c, d) => {
	const sortBy = (method, dates) => {
		if (!dates || !dates.length || dates.length === 1 && !dates[0] || dates.length === 1 && Array.isArray(dates[0]) && !dates[0].length) return null;
		if (dates.length === 1 && dates[0].length > 0) [dates] = dates;
		dates = dates.filter((date) => date);
		let result;
		[result] = dates;
		for (let i = 1; i < dates.length; i += 1) if (!dates[i].isValid() || dates[i][method](result)) result = dates[i];
		return result;
	};
	d.max = function() {
		const args = [].slice.call(arguments, 0);
		return sortBy("isAfter", args);
	};
	d.min = function() {
		const args = [].slice.call(arguments, 0);
		return sortBy("isBefore", args);
	};
};

var negativeYear_default = (_, c, dayjs) => {
	const proto = c.prototype;
	const parseDate = (cfg) => {
		const { date, utc } = cfg;
		if (typeof date === "string" && date.charAt(0) === "-") {
			const normalData = date.slice(1);
			let newDate = dayjs(normalData);
			if (utc) newDate = dayjs.utc(normalData);
			else newDate = dayjs(normalData);
			const fullYear = newDate.year();
			if (date.indexOf(`-${fullYear}`) !== -1) return dayjs(newDate).subtract(fullYear * 2, "year").toDate();
			return date;
		}
		return date;
	};
	const oldParse = proto.parse;
	proto.parse = function(cfg) {
		cfg.date = parseDate.bind(this)(cfg);
		oldParse.bind(this)(cfg);
	};
};

var objectSupport_default = (o, c, dayjs) => {
	const proto = c.prototype;
	const isObject = (obj) => obj !== null && !(obj instanceof Date) && !(obj instanceof Array) && !proto.$utils().u(obj) && obj.constructor.name === "Object";
	const prettyUnit = (u) => {
		const unit = proto.$utils().p(u);
		return unit === "date" ? "day" : unit;
	};
	const parseDate = (cfg) => {
		const { date, utc } = cfg;
		const $d = {};
		if (isObject(date)) {
			if (!Object.keys(date).length) return new Date();
			const now = utc ? dayjs.utc() : dayjs();
			Object.keys(date).forEach((k) => {
				$d[prettyUnit(k)] = date[k];
			});
			const d = $d.day || (!$d.year && !($d.month >= 0) ? now.date() : 1);
			const y = $d.year || now.year();
			const M = $d.month >= 0 ? $d.month : !$d.year && !$d.day ? now.month() : 0;
			const h = $d.hour || 0;
			const m = $d.minute || 0;
			const s = $d.second || 0;
			const ms = $d.millisecond || 0;
			if (utc) return new Date(Date.UTC(y, M, d, h, m, s, ms));
			return new Date(y, M, d, h, m, s, ms);
		}
		return date;
	};
	const oldParse = proto.parse;
	proto.parse = function(cfg) {
		cfg.date = parseDate.bind(this)(cfg);
		oldParse.bind(this)(cfg);
	};
	const oldSet = proto.set;
	const oldAdd = proto.add;
	const oldSubtract = proto.subtract;
	const callObject = function(call, argument, string, offset = 1) {
		const keys = Object.keys(argument);
		let chain = this;
		keys.forEach((key) => {
			chain = call.bind(chain)(argument[key] * offset, key);
		});
		return chain;
	};
	proto.set = function(unit, value) {
		value = value === void 0 ? unit : value;
		if (unit.constructor.name === "Object") return callObject.bind(this)(function(i, s) {
			return oldSet.bind(this)(s, i);
		}, value, unit);
		return oldSet.bind(this)(unit, value);
	};
	proto.add = function(value, unit) {
		if (value.constructor.name === "Object") return callObject.bind(this)(oldAdd, value, unit);
		return oldAdd.bind(this)(value, unit);
	};
	proto.subtract = function(value, unit) {
		if (value.constructor.name === "Object") return callObject.bind(this)(oldAdd, value, unit, -1);
		return oldSubtract.bind(this)(value, unit);
	};
};

var pluralGetSet_default = (o, c) => {
	const proto = c.prototype;
	const pluralAliases = [
		"milliseconds",
		"seconds",
		"minutes",
		"hours",
		"days",
		"weeks",
		"isoWeeks",
		"months",
		"quarters",
		"years",
		"dates"
	];
	pluralAliases.forEach((alias) => {
		proto[alias] = proto[alias.replace(/s$/, "")];
	});
};

var preParsePostFormat_default = (option, dayjsClass) => {
	const oldParse = dayjsClass.prototype.parse;
	dayjsClass.prototype.parse = function(cfg) {
		if (typeof cfg.date === "string") {
			const locale = this.$locale();
			cfg.date = locale && locale.preparse ? locale.preparse(cfg.date) : cfg.date;
		}
		return oldParse.bind(this)(cfg);
	};
	const oldFormat = dayjsClass.prototype.format;
	dayjsClass.prototype.format = function(...args) {
		const result = oldFormat.call(this, ...args);
		const locale = this.$locale();
		return locale && locale.postformat ? locale.postformat(result) : result;
	};
	const oldFromTo = dayjsClass.prototype.fromToBase;
	if (oldFromTo) dayjsClass.prototype.fromToBase = function(input, withoutSuffix, instance, isFrom) {
		const locale = this.$locale() || instance.$locale();
		return oldFromTo.call(this, input, withoutSuffix, instance, isFrom, locale && locale.postformat);
	};
};

var quarterOfYear_default = (o, c) => {
	const proto = c.prototype;
	proto.quarter = function(quarter) {
		if (!this.$utils().u(quarter)) return this.month(this.month() % 3 + (quarter - 1) * 3);
		return Math.ceil((this.month() + 1) / 3);
	};
	const oldAdd = proto.add;
	proto.add = function(number, units) {
		number = Number(number);
		const unit = this.$utils().p(units);
		if (unit === Q$1) return this.add(number * 3, M$1);
		return oldAdd.bind(this)(number, units);
	};
	const oldStartOf = proto.startOf;
	proto.startOf = function(units, startOf) {
		const utils = this.$utils();
		const isStartOf = !utils.u(startOf) ? startOf : true;
		const unit = utils.p(units);
		if (unit === Q$1) {
			const quarter = this.quarter() - 1;
			return isStartOf ? this.month(quarter * 3).startOf(M$1).startOf(D$1) : this.month(quarter * 3 + 2).endOf(M$1).endOf(D$1);
		}
		return oldStartOf.bind(this)(units, startOf);
	};
};

var relativeTime_default = (o, c, d) => {
	o = o || {};
	const proto = c.prototype;
	const relObj = {
		future: "in %s",
		past: "%s ago",
		s: "a few seconds",
		m: "a minute",
		mm: "%d minutes",
		h: "an hour",
		hh: "%d hours",
		d: "a day",
		dd: "%d days",
		M: "a month",
		MM: "%d months",
		y: "a year",
		yy: "%d years"
	};
	d.en.relativeTime = relObj;
	proto.fromToBase = (input, withoutSuffix, instance, isFrom, postFormat) => {
		const loc = instance.$locale().relativeTime || relObj;
		const T = o.thresholds || [
			{
				l: "s",
				r: 44,
				d: S$1
			},
			{
				l: "m",
				r: 89
			},
			{
				l: "mm",
				r: 44,
				d: MIN$1
			},
			{
				l: "h",
				r: 89
			},
			{
				l: "hh",
				r: 21,
				d: H$1
			},
			{
				l: "d",
				r: 35
			},
			{
				l: "dd",
				r: 25,
				d: D$1
			},
			{
				l: "M",
				r: 45
			},
			{
				l: "MM",
				r: 10,
				d: M$1
			},
			{
				l: "y",
				r: 17
			},
			{
				l: "yy",
				d: Y$1
			}
		];
		const Tl = T.length;
		let result;
		let out;
		let isFuture;
		for (let i = 0; i < Tl; i += 1) {
			let t = T[i];
			if (t.d) result = isFrom ? d(input).diff(instance, t.d, true) : instance.diff(input, t.d, true);
			let abs = (o.rounding || Math.round)(Math.abs(result));
			isFuture = result > 0;
			if (abs <= t.r || !t.r) {
				if (abs <= 1 && i > 0) t = T[i - 1];
				const format = loc[t.l];
				if (postFormat) abs = postFormat(`${abs}`);
				if (typeof format === "string") out = format.replace("%d", abs);
				else out = format(abs, withoutSuffix, t.l, isFuture);
				break;
			}
		}
		if (withoutSuffix) return out;
		const pastOrFuture = isFuture ? loc.future : loc.past;
		if (typeof pastOrFuture === "function") return pastOrFuture(out);
		return pastOrFuture.replace("%s", out);
	};
	function fromTo(input, withoutSuffix, instance, isFrom) {
		return proto.fromToBase(input, withoutSuffix, instance, isFrom);
	}
	proto.to = function(input, withoutSuffix) {
		return fromTo(input, withoutSuffix, this, true);
	};
	proto.from = function(input, withoutSuffix) {
		return fromTo(input, withoutSuffix, this);
	};
	const makeNow = (thisDay) => thisDay.$u ? d.utc() : d();
	proto.toNow = function(withoutSuffix) {
		return this.to(makeNow(this), withoutSuffix);
	};
	proto.fromNow = function(withoutSuffix) {
		return this.from(makeNow(this), withoutSuffix);
	};
};

const typeToPos = {
	year: 0,
	month: 1,
	day: 2,
	hour: 3,
	minute: 4,
	second: 5
};
const dtfCache = {};
const getDateTimeFormat = (timezone, options = {}) => {
	const timeZoneName = options.timeZoneName || "short";
	const key = `${timezone}|${timeZoneName}`;
	let dtf = dtfCache[key];
	if (!dtf) {
		dtf = new Intl.DateTimeFormat("en-US", {
			hour12: false,
			timeZone: timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			timeZoneName
		});
		dtfCache[key] = dtf;
	}
	return dtf;
};
var timezone_default = (o, c, d) => {
	let defaultTimezone;
	const makeFormatParts = (timestamp, timezone, options = {}) => {
		const date = new Date(timestamp);
		const dtf = getDateTimeFormat(timezone, options);
		return dtf.formatToParts(date);
	};
	const tzOffset = (timestamp, timezone) => {
		const formatResult = makeFormatParts(timestamp, timezone);
		const filled = [];
		for (let i = 0; i < formatResult.length; i += 1) {
			const { type, value } = formatResult[i];
			const pos = typeToPos[type];
			if (pos >= 0) filled[pos] = parseInt(value, 10);
		}
		const hour = filled[3];
		/* istanbul ignore next */
		const fixedHour = hour === 24 ? 0 : hour;
		const utcString = `${filled[0]}-${filled[1]}-${filled[2]} ${fixedHour}:${filled[4]}:${filled[5]}:000`;
		const utcTs = d.utc(utcString).valueOf();
		let asTS = +timestamp;
		const over = asTS % 1e3;
		asTS -= over;
		return (utcTs - asTS) / (60 * 1e3);
	};
	const fixOffset = (localTS, o0, tz) => {
		let utcGuess = localTS - o0 * 60 * 1e3;
		const o2 = tzOffset(utcGuess, tz);
		if (o0 === o2) return [utcGuess, o0];
		utcGuess -= (o2 - o0) * 60 * 1e3;
		const o3 = tzOffset(utcGuess, tz);
		if (o2 === o3) return [utcGuess, o2];
		return [localTS - Math.min(o2, o3) * 60 * 1e3, Math.max(o2, o3)];
	};
	const proto = c.prototype;
	proto.tz = function(timezone = defaultTimezone, keepLocalTime) {
		const oldOffset = this.utcOffset();
		const date = this.toDate();
		const target = date.toLocaleString("en-US", { timeZone: timezone });
		const diff = Math.round((date - new Date(target)) / 1e3 / 60);
		const offset = -Math.round(date.getTimezoneOffset() / 15) * 15 - diff;
		const isUTC = !Number(offset);
		let ins;
		if (isUTC) ins = this.utcOffset(0, keepLocalTime);
		else {
			ins = d(target, { locale: this.$L }).$set(MS$1, this.$ms).utcOffset(offset, true);
			if (keepLocalTime) {
				const newOffset = ins.utcOffset();
				ins = ins.add(oldOffset - newOffset, MIN$1);
			}
		}
		ins.$x.$timezone = timezone;
		return ins;
	};
	proto.offsetName = function(type) {
		const zone = this.$x.$timezone || d.tz.guess();
		const result = makeFormatParts(this.valueOf(), zone, { timeZoneName: type }).find((m) => m.type.toLowerCase() === "timezonename");
		return result && result.value;
	};
	const oldStartOf = proto.startOf;
	proto.startOf = function(units, startOf) {
		if (!this.$x || !this.$x.$timezone) return oldStartOf.call(this, units, startOf);
		const withoutTz = d(this.format("YYYY-MM-DD HH:mm:ss:SSS"), { locale: this.$L });
		const startOfWithoutTz = oldStartOf.call(withoutTz, units, startOf);
		return startOfWithoutTz.tz(this.$x.$timezone, true);
	};
	d.tz = function(input, arg1, arg2) {
		const parseFormat = arg2 && arg1;
		const timezone = arg2 || arg1 || defaultTimezone;
		const previousOffset = tzOffset(+d(), timezone);
		if (typeof input !== "string") return d(input).tz(timezone);
		const localTs = d.utc(input, parseFormat).valueOf();
		const [targetTs, targetOffset] = fixOffset(localTs, previousOffset, timezone);
		const ins = d(targetTs).utcOffset(targetOffset);
		ins.$x.$timezone = timezone;
		return ins;
	};
	d.tz.guess = function() {
		return Intl.DateTimeFormat().resolvedOptions().timeZone;
	};
	d.tz.setDefault = function(timezone) {
		defaultTimezone = timezone;
	};
};

var toArray_default = (o, c) => {
	const proto = c.prototype;
	proto.toArray = function() {
		return [
			this.$y,
			this.$M,
			this.$D,
			this.$H,
			this.$m,
			this.$s,
			this.$ms
		];
	};
};

var toObject_default = (o, c) => {
	const proto = c.prototype;
	proto.toObject = function() {
		return {
			years: this.$y,
			months: this.$M,
			date: this.$D,
			hours: this.$H,
			minutes: this.$m,
			seconds: this.$s,
			milliseconds: this.$ms
		};
	};
};

var updateLocale_default = (option, Dayjs, dayjs) => {
	dayjs.updateLocale = function(locale, customConfig) {
		const localeList = dayjs.Ls;
		const localeConfig = localeList[locale];
		if (!localeConfig) return;
		const customConfigKeys = customConfig ? Object.keys(customConfig) : [];
		customConfigKeys.forEach((c) => {
			localeConfig[c] = customConfig[c];
		});
		return localeConfig;
	};
};

const REGEX_VALID_OFFSET_FORMAT = /[+-]\d\d(?::?\d\d)?/g;
const REGEX_OFFSET_HOURS_MINUTES_FORMAT = /([+-]|\d\d)/g;
function offsetFromString(value = "") {
	const offset = value.match(REGEX_VALID_OFFSET_FORMAT);
	if (!offset) return null;
	const [indicator, hoursOffset, minutesOffset] = `${offset[0]}`.match(REGEX_OFFSET_HOURS_MINUTES_FORMAT) || [
		"-",
		0,
		0
	];
	const totalOffsetInMinutes = +hoursOffset * 60 + +minutesOffset;
	if (totalOffsetInMinutes === 0) return 0;
	return indicator === "+" ? totalOffsetInMinutes : -totalOffsetInMinutes;
}
var utc_default = (option, Dayjs, dayjs) => {
	const proto = Dayjs.prototype;
	dayjs.utc = function(date) {
		const cfg = {
			date,
			utc: true,
			args: arguments
		};
		return new Dayjs(cfg);
	};
	proto.utc = function(keepLocalTime) {
		const ins = dayjs(this.toDate(), {
			locale: this.$L,
			utc: true
		});
		if (keepLocalTime) return ins.add(this.utcOffset(), MIN$1);
		return ins;
	};
	proto.local = function() {
		return dayjs(this.toDate(), {
			locale: this.$L,
			utc: false
		});
	};
	const oldParse = proto.parse;
	proto.parse = function(cfg) {
		if (cfg.utc) this.$u = true;
		if (!this.$utils().u(cfg.$offset)) this.$offset = cfg.$offset;
		oldParse.call(this, cfg);
	};
	const oldInit = proto.init;
	proto.init = function() {
		if (this.$u) {
			const { $d } = this;
			this.$y = $d.getUTCFullYear();
			this.$M = $d.getUTCMonth();
			this.$D = $d.getUTCDate();
			this.$W = $d.getUTCDay();
			this.$H = $d.getUTCHours();
			this.$m = $d.getUTCMinutes();
			this.$s = $d.getUTCSeconds();
			this.$ms = $d.getUTCMilliseconds();
		} else oldInit.call(this);
	};
	const oldUtcOffset = proto.utcOffset;
	proto.utcOffset = function(input, keepLocalTime) {
		const { u } = this.$utils();
		if (u(input)) {
			if (this.$u) return 0;
			if (!u(this.$offset)) return this.$offset;
			return oldUtcOffset.call(this);
		}
		if (typeof input === "string") {
			input = offsetFromString(input);
			if (input === null) return this;
		}
		const offset = Math.abs(input) <= 16 ? input * 60 : input;
		let ins = this;
		if (keepLocalTime) {
			ins.$offset = offset;
			ins.$u = input === 0;
			return ins;
		}
		if (input !== 0) {
			const localTimezoneOffset = this.$u ? this.toDate().getTimezoneOffset() : -1 * this.utcOffset();
			ins = this.local().add(offset + localTimezoneOffset, MIN$1);
			ins.$offset = offset;
			ins.$x.$localOffset = localTimezoneOffset;
		} else ins = this.utc();
		return ins;
	};
	const oldFormat = proto.format;
	const UTC_FORMAT_DEFAULT = "YYYY-MM-DDTHH:mm:ss[Z]";
	proto.format = function(formatStr) {
		const str = formatStr || (this.$u ? UTC_FORMAT_DEFAULT : "");
		return oldFormat.call(this, str);
	};
	proto.valueOf = function() {
		const addedOffset = !this.$utils().u(this.$offset) ? this.$offset + (this.$x.$localOffset || this.$d.getTimezoneOffset()) : 0;
		return this.$d.valueOf() - addedOffset * MILLISECONDS_A_MINUTE;
	};
	proto.isUTC = function() {
		return !!this.$u;
	};
	proto.toISOString = function() {
		return this.toDate().toISOString();
	};
	proto.toString = function() {
		return this.toDate().toUTCString();
	};
	const oldToDate = proto.toDate;
	proto.toDate = function(type) {
		if (type === "s" && this.$offset) return dayjs(this.format("YYYY-MM-DD HH:mm:ss:SSS")).toDate();
		return oldToDate.call(this);
	};
	const oldDiff = proto.diff;
	proto.diff = function(input, units, float) {
		if (input && this.$u === input.$u) return oldDiff.call(this, input, units, float);
		const localThis = this.local();
		const localInput = dayjs(input).local();
		return oldDiff.call(localThis, localInput, units, float);
	};
};

var weekday_default = (o, c) => {
	const proto = c.prototype;
	proto.weekday = function(input) {
		const weekStart = this.$locale().weekStart || 0;
		const { $W } = this;
		const weekday = ($W < weekStart ? $W + 7 : $W) - weekStart;
		if (this.$utils().u(input)) return weekday;
		return this.subtract(weekday, "day").add(input, "day");
	};
};

var weekOfYear_default = (o, c, d) => {
	const proto = c.prototype;
	proto.week = function(week = null) {
		if (week !== null) return this.add((week - this.week()) * 7, D$1);
		const yearStart = this.$locale().yearStart || 1;
		if (this.month() === 11 && this.date() > 25) {
			const nextYearStartDay = d(this).startOf(Y$1).add(1, Y$1).date(yearStart);
			const thisEndOfWeek = d(this).endOf(W$1);
			if (nextYearStartDay.isBefore(thisEndOfWeek)) return 1;
		}
		const yearStartDay = d(this).startOf(Y$1).date(yearStart);
		const yearStartWeek = yearStartDay.startOf(W$1).subtract(1, MS$1);
		const diffInWeek = this.diff(yearStartWeek, W$1, true);
		if (diffInWeek < 0) return d(this).startOf("week").week();
		return Math.ceil(diffInWeek);
	};
	proto.weeks = function(week = null) {
		return this.week(week);
	};
};

var weekYear_default = (o, c) => {
	const proto = c.prototype;
	proto.weekYear = function() {
		const month = this.month();
		const weekOfYear = this.week();
		const year = this.year();
		if (weekOfYear === 1 && month === 11) return year + 1;
		if (month === 0 && weekOfYear >= 52) return year - 1;
		return year;
	};
};

let L = "en";
const Ls = {};
Ls[L] = en_default;
const IS_DAYJS = "$isDayjsObject";
const isDayjs = (d) => d instanceof Dayjs || !!(d && d[IS_DAYJS]);
const parseLocale = (preset, object, isLocal) => {
	let l;
	if (!preset) return L;
	if (typeof preset === "string") {
		const presetLower = preset.toLowerCase();
		if (Ls[presetLower]) l = presetLower;
		if (object) {
			Ls[presetLower] = object;
			l = presetLower;
		}
		const presetSplit = preset.split("-");
		if (!l && presetSplit.length > 1) return parseLocale(presetSplit[0]);
	} else {
		const { name } = preset;
		Ls[name] = preset;
		l = name;
	}
	if (!isLocal && l) L = l;
	return l || !isLocal && L;
};
const dayjs = function(date, c) {
	if (isDayjs(date)) return date.clone();
	const cfg = typeof c === "object" ? c : {};
	cfg.date = date;
	cfg.args = arguments;
	return new Dayjs(cfg);
};
const wrapper = (date, instance) => dayjs(date, {
	locale: instance.$L,
	utc: instance.$u,
	x: instance.$x,
	$offset: instance.$offset
});
const Utils = utils_default;
Utils.l = parseLocale;
Utils.i = isDayjs;
Utils.w = wrapper;
const parseDate = (cfg) => {
	const { date, utc } = cfg;
	if (date === null) return new Date(NaN);
	if (Utils.u(date)) return new Date();
	if (date instanceof Date) return new Date(date);
	if (typeof date === "string" && !/Z$/i.test(date)) {
		const d = date.match(
			// global locale
			// global loaded locale
			// eslint-disable-line prefer-rest-params
			// eslint-disable-line no-use-before-define
			// todo: refactor; do not use this.$offset in you code
			// for plugin use
			// null is invalid
			// today
			// everything else
			// for plugin
			// startOf -> endOf
			// private set
			// eslint-disable-line no-param-reassign
			// ms
			// 'ZZ' logic below
			// 'ZZ'
			// milliseconds
			// get locale object
			// install plugin only once
			REGEX_PARSE$1
);
		if (d) {
			const m = d[2] - 1 || 0;
			const ms = (d[7] || "0").substring(0, 3);
			if (utc) return new Date(Date.UTC(d[1], m, d[3] || 1, d[4] || 0, d[5] || 0, d[6] || 0, ms));
			return new Date(d[1], m, d[3] || 1, d[4] || 0, d[5] || 0, d[6] || 0, ms);
		}
	}
	return new Date(date);
};
class Dayjs {
	constructor(cfg) {
		this.$L = parseLocale(cfg.locale, null, true);
		this.parse(cfg);
		this.$x = this.$x || cfg.x || {};
		this[IS_DAYJS] = true;
	}
	parse(cfg) {
		this.$d = parseDate(cfg);
		this.init();
	}
	init() {
		const { $d } = this;
		this.$y = $d.getFullYear();
		this.$M = $d.getMonth();
		this.$D = $d.getDate();
		this.$W = $d.getDay();
		this.$H = $d.getHours();
		this.$m = $d.getMinutes();
		this.$s = $d.getSeconds();
		this.$ms = $d.getMilliseconds();
	}
	$utils() {
		return Utils;
	}
	isValid() {
		return !(this.$d.toString() === INVALID_DATE_STRING);
	}
	isSame(that, units) {
		const other = dayjs(that);
		return this.startOf(units) <= other && other <= this.endOf(units);
	}
	isAfter(that, units) {
		return dayjs(that) < this.startOf(units);
	}
	isBefore(that, units) {
		return this.endOf(units) < dayjs(that);
	}
	$g(input, get, set) {
		if (Utils.u(input)) return this[get];
		return this.set(set, input);
	}
	unix() {
		return Math.floor(this.valueOf() / 1e3);
	}
	valueOf() {
		return this.$d.getTime();
	}
	startOf(units, startOf) {
		const isStartOf = !Utils.u(startOf) ? startOf : true;
		const unit = Utils.p(units);
		const instanceFactory = (d, m) => {
			const ins = Utils.w(this.$u ? Date.UTC(this.$y, m, d) : new Date(this.$y, m, d), this);
			return isStartOf ? ins : ins.endOf(D$1);
		};
		const instanceFactorySet = (method, slice) => {
			const argumentStart = [
				0,
				0,
				0,
				0
			];
			const argumentEnd = [
				23,
				59,
				59,
				999
			];
			return Utils.w(this.toDate()[method].apply(
				// eslint-disable-line prefer-spread
				this.toDate("s"),
				(isStartOf ? argumentStart : argumentEnd).slice(slice)
), this);
		};
		const { $W, $M, $D } = this;
		const utcPad = `set${this.$u ? "UTC" : ""}`;
		switch (unit) {
			case Y$1: return isStartOf ? instanceFactory(1, 0) : instanceFactory(31, 11);
			case M$1: return isStartOf ? instanceFactory(1, $M) : instanceFactory(0, $M + 1);
			case W$1: {
				const weekStart = this.$locale().weekStart || 0;
				const gap = ($W < weekStart ? $W + 7 : $W) - weekStart;
				return instanceFactory(isStartOf ? $D - gap : $D + (6 - gap), $M);
			}
			case D$1:
			case DATE$1: return instanceFactorySet(`${utcPad}Hours`, 0);
			case H$1: return instanceFactorySet(`${utcPad}Minutes`, 1);
			case MIN$1: return instanceFactorySet(`${utcPad}Seconds`, 2);
			case S$1: return instanceFactorySet(`${utcPad}Milliseconds`, 3);
			default: return this.clone();
		}
	}
	endOf(arg) {
		return this.startOf(arg, false);
	}
	$set(units, int) {
		const unit = Utils.p(units);
		const utcPad = `set${this.$u ? "UTC" : ""}`;
		const name = {
			[D$1]: `${utcPad}Date`,
			[DATE$1]: `${utcPad}Date`,
			[M$1]: `${utcPad}Month`,
			[Y$1]: `${utcPad}FullYear`,
			[H$1]: `${utcPad}Hours`,
			[MIN$1]: `${utcPad}Minutes`,
			[S$1]: `${utcPad}Seconds`,
			[MS$1]: `${utcPad}Milliseconds`
		}[unit];
		const arg = unit === D$1 ? this.$D + (int - this.$W) : int;
		if (unit === M$1 || unit === Y$1) {
			const date = this.clone().set(DATE$1, 1);
			date.$d[name](arg);
			date.init();
			this.$d = date.set(DATE$1, Math.min(this.$D, date.daysInMonth())).$d;
		} else if (name) this.$d[name](arg);
		this.init();
		return this;
	}
	set(string, int) {
		return this.clone().$set(string, int);
	}
	get(unit) {
		return this[Utils.p(unit)]();
	}
	add(number, units) {
		number = Number(number);
		const unit = Utils.p(units);
		const instanceFactorySet = (n) => {
			const d = dayjs(this);
			return Utils.w(d.date(d.date() + Math.round(n * number)), this);
		};
		if (unit === M$1) return this.set(M$1, this.$M + number);
		if (unit === Y$1) return this.set(Y$1, this.$y + number);
		if (unit === D$1) return instanceFactorySet(1);
		if (unit === W$1) return instanceFactorySet(7);
		const step = {
			[MIN$1]: MILLISECONDS_A_MINUTE,
			[H$1]: MILLISECONDS_A_HOUR,
			[S$1]: MILLISECONDS_A_SECOND
		}[unit] || 1;
		const nextTimeStamp = this.$d.getTime() + number * step;
		return Utils.w(nextTimeStamp, this);
	}
	subtract(number, string) {
		return this.add(number * -1, string);
	}
	format(formatStr) {
		const locale = this.$locale();
		if (!this.isValid()) return locale.invalidDate || INVALID_DATE_STRING;
		const str = formatStr || FORMAT_DEFAULT;
		const zoneStr = Utils.z(this);
		const { $H, $m, $M } = this;
		const { weekdays, months, meridiem } = locale;
		const getShort = (arr, index, full, length) => arr && (arr[index] || arr(this, str)) || full[index].slice(0, length);
		const get$H = (num) => Utils.s($H % 12 || 12, num, "0");
		const meridiemFunc = meridiem || ((hour, minute, isLowercase) => {
			const m = hour < 12 ? "AM" : "PM";
			return isLowercase ? m.toLowerCase() : m;
		});
		const matches = (match) => {
			switch (match) {
				case "YY": return String(this.$y).slice(-2);
				case "YYYY": return Utils.s(this.$y, 4, "0");
				case "M": return $M + 1;
				case "MM": return Utils.s($M + 1, 2, "0");
				case "MMM": return getShort(locale.monthsShort, $M, months, 3);
				case "MMMM": return getShort(months, $M);
				case "D": return this.$D;
				case "DD": return Utils.s(this.$D, 2, "0");
				case "d": return String(this.$W);
				case "dd": return getShort(locale.weekdaysMin, this.$W, weekdays, 2);
				case "ddd": return getShort(locale.weekdaysShort, this.$W, weekdays, 3);
				case "dddd": return weekdays[this.$W];
				case "H": return String($H);
				case "HH": return Utils.s($H, 2, "0");
				case "h": return get$H(1);
				case "hh": return get$H(2);
				case "a": return meridiemFunc($H, $m, true);
				case "A": return meridiemFunc($H, $m, false);
				case "m": return String($m);
				case "mm": return Utils.s($m, 2, "0");
				case "s": return String(this.$s);
				case "ss": return Utils.s(this.$s, 2, "0");
				case "SSS": return Utils.s(this.$ms, 3, "0");
				case "Z": return zoneStr;
				default: break;
			}
			return null;
		};
		return str.replace(REGEX_FORMAT$1, (match, $1) => $1 || matches(match) || zoneStr.replace(":", ""));
	}
	utcOffset() {
		return -Math.round(this.$d.getTimezoneOffset() / 15) * 15;
	}
	diff(input, units, float) {
		const unit = Utils.p(units);
		const that = dayjs(input);
		const zoneDelta = (that.utcOffset() - this.utcOffset()) * MILLISECONDS_A_MINUTE;
		const diff = this - that;
		const getMonth = () => Utils.m(this, that);
		let result;
		switch (unit) {
			case Y$1:
				result = getMonth() / 12;
				break;
			case M$1:
				result = getMonth();
				break;
			case Q$1:
				result = getMonth() / 3;
				break;
			case W$1:
				result = (diff - zoneDelta) / MILLISECONDS_A_WEEK;
				break;
			case D$1:
				result = (diff - zoneDelta) / MILLISECONDS_A_DAY;
				break;
			case H$1:
				result = diff / MILLISECONDS_A_HOUR;
				break;
			case MIN$1:
				result = diff / MILLISECONDS_A_MINUTE;
				break;
			case S$1:
				result = diff / MILLISECONDS_A_SECOND;
				break;
			default:
				result = diff;
				break;
		}
		return float ? result : Utils.a(result);
	}
	daysInMonth() {
		return this.endOf(M$1).$D;
	}
	$locale() {
		return Ls[this.$L];
	}
	locale(preset, object) {
		if (!preset) return this.$L;
		const that = this.clone();
		const nextLocaleName = parseLocale(preset, object, true);
		if (nextLocaleName) that.$L = nextLocaleName;
		return that;
	}
	clone() {
		return Utils.w(this.$d, this);
	}
	toDate() {
		return new Date(this.valueOf());
	}
	toJSON() {
		return this.isValid() ? this.toISOString() : null;
	}
	toISOString() {
		return this.$d.toISOString();
	}
	toString() {
		return this.$d.toUTCString();
	}
}
const proto = Dayjs.prototype;
dayjs.prototype = proto;
[
	["$ms", MS$1],
	["$s", S$1],
	["$m", MIN$1],
	["$H", H$1],
	["$W", D$1],
	["$M", M$1],
	["$y", Y$1],
	["$D", DATE$1]
].forEach((g) => {
	proto[g[1]] = function(input) {
		return this.$g(input, g[0], g[1]);
	};
});
dayjs.extend = (plugin, option) => {
	if (!plugin.$i) {
		plugin(option, Dayjs, dayjs);
		plugin.$i = true;
	}
	return dayjs;
};
dayjs.locale = parseLocale;
dayjs.isDayjs = isDayjs;
dayjs.unix = (timestamp) => dayjs(timestamp * 1e3);
dayjs.en = Ls[L];
dayjs.Ls = Ls;
dayjs.p = {};
var src_default$1 = dayjs;
const utils = utils_default;

export { D$1 as D, DATE$1 as DATE, FORMAT_DEFAULT, H$1 as H, INVALID_DATE_STRING, M$1 as M, MILLISECONDS_A_DAY, MILLISECONDS_A_HOUR, MILLISECONDS_A_MINUTE, MILLISECONDS_A_SECOND, MILLISECONDS_A_WEEK, MIN$1 as MIN, MS$1 as MS, Q$1 as Q, REGEX_FORMAT$1 as REGEX_FORMAT, REGEX_PARSE$1 as REGEX_PARSE, S$1 as S, SECONDS_A_DAY, SECONDS_A_HOUR, SECONDS_A_MINUTE, SECONDS_A_WEEK, W$1 as W, Y$1 as Y, advancedFormat_default as advancedFormat, arraySupport_default as arraySupport, badMutable_default as badMutable, bigIntSupport_default as bigIntSupport, buddhistEra_default as buddhistEra, calendar_default as calendar, customParseFormat_default as customParseFormat, dayOfYear_default as dayOfYear, src_default$1 as default, devHelper_default as devHelper, duration_default as duration, isBetween_default as isBetween, isLeapYear_default as isLeapYear, isMoment_default as isMoment, isSameOrAfter_default as isSameOrAfter, isSameOrBefore_default as isSameOrBefore, isToday_default as isToday, isTomorrow_default as isTomorrow, isYesterday_default as isYesterday, isoWeek_default as isoWeek, isoWeeksInYear_default as isoWeeksInYear, localeData_default as localeData, localizedFormat_default as localizedFormat, minMax_default as minMax, negativeYear_default as negativeYear, objectSupport_default as objectSupport, pluralGetSet_default as pluralGetSet, preParsePostFormat_default as preParsePostFormat, quarterOfYear_default as quarterOfYear, relativeTime_default as relativeTime, timezone_default as timezone, toArray_default as toArray, toObject_default as toObject, updateLocale_default as updateLocale, utc_default as utc, utils, weekOfYear_default as weekOfYear, weekYear_default as weekYear, weekday_default as weekday };