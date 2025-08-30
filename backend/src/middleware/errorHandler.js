export default function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: err.message || 'Something went wrong on the server'
  });
}
