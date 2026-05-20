/** Deutsche Lokalisierung für alle UI-Werte. */

const nfPercent = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const nfMoney = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const nfWhole = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 })

export const formatPercent1 = (v: number): string => `${nfPercent.format(v)} %`
export const formatPercent0 = (v: number): string => `${nfWhole.format(v)} %`
export const formatEurM = (v: number): string => `${nfMoney.format(v)} Mio. EUR`
export const formatInt = (v: number): string => nfWhole.format(v)

const monthShort = ['Q1', 'Q2', 'Q3', 'Q4']
export const quarterLabel = (i: number): string => monthShort[i % 4] ?? `Q${i + 1}`
