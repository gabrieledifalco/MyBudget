export function notFound(req, res) {
  res.status(404).json({ message: `Risorsa non trovata: ${req.method} ${req.originalUrl}` });
}
