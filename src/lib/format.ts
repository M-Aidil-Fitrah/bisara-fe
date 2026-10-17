export const shortName = (n: string) => {
  const [a, b] = n.split(' ')
  return b ? `${a} ${b[0]}.` : (a ?? n)
}

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
