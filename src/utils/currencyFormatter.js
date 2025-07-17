// src/utils/currencyFormatter.js
// export const formatCurrency = (value) => {
//   if (isNaN(value)) return 'GH0.00';
  
//   return new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: 'GH',
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2
//   }).format(value);
// };

// Alternative version with Ghanaian Cedi (GHS)

export const formatCurrency = (value) => {
  if (isNaN(value)) return 'GH₵0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};
