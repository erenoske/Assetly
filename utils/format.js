export const formatNumber = (num, options = {}) => {
  if (num === null || num === undefined || isNaN(num)) return "-";

  return "$" + Number(num).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });
};