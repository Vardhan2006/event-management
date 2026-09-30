function parseDateOnly(dateStr) {
  if (typeof dateStr !== "string") return null;

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return null;

  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function getTodayUTCMidnight() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

function isPast(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return true;
  const today = getTodayUTCMidnight();
  return date.getTime() < today.getTime();
}

module.exports = {
  parseDateOnly,
  getTodayUTCMidnight,
  isPast,
};
