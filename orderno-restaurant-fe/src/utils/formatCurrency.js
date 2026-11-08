export const formatVND = (amount) => {
  if (amount == null) return '';
  return new Intl.NumberFormat('en-US').format(amount) + ' VND';
};

