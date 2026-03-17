// ─── VV_REVENUE ── Berater-level revenue data ───────────────────────────

export const VV_REVENUE = {
  monthlyRevenue: [
    { name: 'Jan', managementFee: 22800, performanceFee: 0, sonstiges: 1200 },
    { name: 'Feb', managementFee: 23100, performanceFee: 0, sonstiges: 950 },
    { name: 'Mär', managementFee: 23400, performanceFee: 3200, sonstiges: 1100 },
    { name: 'Apr', managementFee: 23200, performanceFee: 0, sonstiges: 800 },
    { name: 'Mai', managementFee: 23500, performanceFee: 0, sonstiges: 1500 },
    { name: 'Jun', managementFee: 23800, performanceFee: 4100, sonstiges: 1050 },
    { name: 'Jul', managementFee: 24100, performanceFee: 0, sonstiges: 900 },
    { name: 'Aug', managementFee: 23600, performanceFee: 0, sonstiges: 1300 },
    { name: 'Sep', managementFee: 24200, performanceFee: 5500, sonstiges: 1100 },
    { name: 'Okt', managementFee: 24500, performanceFee: 0, sonstiges: 950 },
    { name: 'Nov', managementFee: 24800, performanceFee: 0, sonstiges: 1200 },
    { name: 'Dez', managementFee: 25200, performanceFee: 8200, sonstiges: 2800 },
  ],

  mandantenRevenue: [
    { name: 'Tim Keller', aum: 12500000, fee: 0.85, ertrag: 106250 },
    { name: 'Fam. Lindenberg', aum: 2100000, fee: 1.05, ertrag: 22050 },
    { name: 'Stiftung Weber', aum: 8300000, fee: 0.75, ertrag: 62250 },
    { name: 'Prof. Hartmann', aum: 6800000, fee: 0.85, ertrag: 57800 },
    { name: 'Maxim Meydarn', aum: 450000, fee: 1.05, ertrag: 4725 },
  ],

  feeStruktur: [
    { typ: 'Management Fee', volumen: 232100, anteil: 83.8 },
    { typ: 'Performance Fee', volumen: 21000, anteil: 7.6 },
    { typ: 'Transaktionskosten', volumen: 12350, anteil: 4.5 },
    { typ: 'Sonstiges', volumen: 11400, anteil: 4.1 },
  ],

  forecast: {
    q1: 78700,
    q2: 85200,
    q3: 92500,
    q4: 105600,
  },
};
