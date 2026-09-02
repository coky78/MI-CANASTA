export function compararCanasta(resultados) {
  return [...resultados]
    .sort((a, b) => a.total - b.total)
    .map((item, index) => ({
      ...item,
      mejorPrecio: index === 0
    }));
}
