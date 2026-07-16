export function errorHandler(err, req, res, next) {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      message: "ไฟล์รูปภาพมีขนาดใหญ่เกินไป กรุณาเลือกไฟล์ไม่เกิน 20MB",
      code: err.code,
    });
  }

  const status = err.status || 500;
  const payload = { message: err.message || "Server error" };
  if (err.code) payload.code = err.code;
  res.status(status).json(payload);
}
