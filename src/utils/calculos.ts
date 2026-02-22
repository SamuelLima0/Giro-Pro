export function calcularLucro(custo: number, venda: number, taxas: number) {
  const valorTaxas = venda * (taxas / 100);
  return venda - custo - valorTaxas;
}

export function calcularMargem(lucro: number, venda: number) {
  if (venda === 0) return 0;
  return (lucro / venda) * 100;
}

export function calcularPrecoSeguro(custo: number, margemDesejada: number, taxas: number) {
  // preco = custo / (1 - margem/100) + (preco * taxas/100)
  // preco - (preco * taxas/100) = custo / (1 - margem/100)
  // preco * (1 - taxas/100) = custo / (1 - margem/100)
  // preco = custo / ((1 - margem/100) * (1 - taxas/100))
  
  // The user provided formula: preco = custo / (1 - margem/100) + taxas
  // But usually "taxas" in this context is a percentage of the final price.
  // I will follow the user's provided logic if it's simple, but "taxas" as a flat value or percentage?
  // User said "Taxas (%)" in requirements.
  
  const m = margemDesejada / 100;
  const t = taxas / 100;
  
  if (1 - m - t <= 0) return 0;
  
  return custo / (1 - m - t);
}

export function calcularGiroMedio(produtosVendidos: { createdAt: number, soldAt?: number }[]) {
  if (produtosVendidos.length === 0) return 0;
  
  const totalDias = produtosVendidos.reduce((acc, p) => {
    if (!p.soldAt) return acc;
    const diffTime = Math.abs(p.soldAt - p.createdAt);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return acc + diffDays;
  }, 0);
  
  return totalDias / produtosVendidos.length;
}
