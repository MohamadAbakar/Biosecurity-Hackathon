/**
 * Normalize a raw voltage reading (0–1023 ADC) to millivolts.
 * Assumes 5V reference and 10-bit ADC.
 */
const adcToMillivolts = (adcValue, refVoltage = 5000) =>
  (adcValue / 1023) * refVoltage;

/**
 * Compute a simple rolling average over an array of numbers.
 */
const rollingAverage = (values, windowSize = 5) => {
  if (!values || values.length === 0) return [];
  return values.map((_, i) => {
    const start = Math.max(0, i - windowSize + 1);
    const slice = values.slice(start, i + 1);
    return slice.reduce((sum, v) => sum + v, 0) / slice.length;
  });
};

/**
 * Clamp a number between min and max.
 */
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Convert seconds to a human-readable duration string (e.g. "2m 34s").
 */
const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

/**
 * Parse a comma-separated list of amino acid abbreviations into an array.
 */
const parseSequence = (sequence) =>
  sequence
    .toUpperCase()
    .replace(/\s/g, '')
    .split('');

/**
 * Build a SQL WHERE clause fragment and param array from a filters object.
 * Keys map to column names; values are the search terms.
 */
const buildWhereClause = (filters, startIndex = 1) => {
  const conditions = [];
  const params = [];
  let idx = startIndex;

  for (const [col, val] of Object.entries(filters)) {
    if (val !== undefined && val !== null && val !== '') {
      conditions.push(`${col} ILIKE $${idx}`);
      params.push(`%${val}%`);
      idx++;
    }
  }

  return {
    clause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
    nextIndex: idx,
  };
};

module.exports = {
  adcToMillivolts,
  rollingAverage,
  clamp,
  formatDuration,
  parseSequence,
  buildWhereClause,
};
