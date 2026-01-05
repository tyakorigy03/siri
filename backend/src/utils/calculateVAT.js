
// src/utils/calculateVAT.js - VAT Calculation Utilities
/**
 * Calculate VAT for INCLUSIVE pricing
 * (Total already includes VAT, extract the VAT amount)
 * 
 * @param {number} totalInclusive - Total amount including VAT
 * @param {number} vatRate - VAT rate (e.g., 18 for 18%)
 * @returns {object} { totalExclVAT, vatAmount, totalInclVAT }
 */
function calculateInclusiveVAT(totalInclusive, vatRate = 18) {
  const divisor = 1 + (vatRate / 100);
  const totalExclVAT = totalInclusive / divisor;
  const vatAmount = totalInclusive - totalExclVAT;

  return {
    totalExclVAT: parseFloat(totalExclVAT.toFixed(2)),
    vatAmount: parseFloat(vatAmount.toFixed(2)),
    totalInclVAT: parseFloat(totalInclusive.toFixed(2))
  };
}

/**
 * Calculate VAT for EXCLUSIVE pricing
 * (Add VAT to the base amount)
 * 
 * @param {number} totalExclusive - Total amount excluding VAT
 * @param {number} vatRate - VAT rate (e.g., 18 for 18%)
 * @returns {object} { totalExclVAT, vatAmount, totalInclVAT }
 */
function calculateExclusiveVAT(totalExclusive, vatRate = 18) {
  const vatAmount = totalExclusive * (vatRate / 100);
  const totalInclVAT = totalExclusive + vatAmount;

  return {
    totalExclVAT: parseFloat(totalExclusive.toFixed(2)),
    vatAmount: parseFloat(vatAmount.toFixed(2)),
    totalInclVAT: parseFloat(totalInclVAT.toFixed(2))
  };
}

/**
 * Calculate sale totals based on items and pricing mode
 * 
 * @param {array} items - Array of sale items
 * @param {string} pricingMode - 'INCLUSIVE' or 'EXCLUSIVE'
 * @param {number} vatRate - VAT rate (e.g., 18 for 18%)
 * @param {number} discountAmount - Total discount amount
 * @returns {object} Sale totals
 */
function calculateSaleTotals(items, pricingMode = 'INCLUSIVE', vatRate = 18, discountAmount = 0) {
  // Calculate line totals
  let subtotal = 0;
  items.forEach(item => {
    const lineTotal = (item.unit_price * item.quantity) - (item.discount || 0);
    subtotal += lineTotal;
  });

  // Apply discount
  const totalAfterDiscount = subtotal - discountAmount;

  // Calculate VAT based on pricing mode
  let result;
  if (pricingMode === 'INCLUSIVE') {
    result = calculateInclusiveVAT(totalAfterDiscount, vatRate);
  } else {
    result = calculateExclusiveVAT(totalAfterDiscount, vatRate);
  }

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    totalExclVAT: result.totalExclVAT,
    vatAmount: result.vatAmount,
    totalInclVAT: result.totalInclVAT,
    grandTotal: result.totalInclVAT
  };
}

/**
 * Calculate withholding tax on an amount
 * 
 * @param {number} amount - Base amount
 * @param {number} whtRate - WHT rate (e.g., 3 for 3%, 15 for 15%)
 * @returns {object} { whtAmount, netPayable }
 */
function calculateWithholdingTax(amount, whtRate = 0) {
  const whtAmount = amount * (whtRate / 100);
  const netPayable = amount - whtAmount;

  return {
    whtAmount: parseFloat(whtAmount.toFixed(2)),
    netPayable: parseFloat(netPayable.toFixed(2))
  };
}

/**
 * Calculate PAYE (Pay As You Earn) tax for Rwanda
 * 
 * @param {number} grossSalary - Gross salary amount
 * @returns {object} { taxableIncome, payeTax, netSalary }
 */
function calculatePAYE(grossSalary) {
  const exemption = 30000; // Rwanda tax exemption
  const taxableIncome = Math.max(0, grossSalary - exemption);

  let payeTax = 0;

  // Rwanda PAYE brackets
  if (taxableIncome <= 30000) {
    payeTax = 0;
  } else if (taxableIncome <= 100000) {
    payeTax = (taxableIncome - 30000) * 0.20;
  } else {
    payeTax = (70000 * 0.20) + ((taxableIncome - 100000) * 0.30);
  }

  return {
    taxableIncome: parseFloat(taxableIncome.toFixed(2)),
    payeTax: parseFloat(payeTax.toFixed(2)),
    netSalary: parseFloat((grossSalary - payeTax).toFixed(2))
  };
}

/**
 * Calculate social security contribution (RSSB in Rwanda)
 * 
 * @param {number} grossSalary - Gross salary
 * @returns {object} { employeeContribution, employerContribution, totalContribution }
 */
function calculateSocialSecurity(grossSalary) {
  const employeeRate = 3; // 3% employee contribution
  const employerRate = 5; // 5% employer contribution

  const employeeContribution = grossSalary * (employeeRate / 100);
  const employerContribution = grossSalary * (employerRate / 100);
  const totalContribution = employeeContribution + employerContribution;

  return {
    employeeContribution: parseFloat(employeeContribution.toFixed(2)),
    employerContribution: parseFloat(employerContribution.toFixed(2)),
    totalContribution: parseFloat(totalContribution.toFixed(2))
  };
}

module.exports = {
  calculateInclusiveVAT,
  calculateExclusiveVAT,
  calculateSaleTotals,
  calculateWithholdingTax,
  calculatePAYE,
  calculateSocialSecurity
};