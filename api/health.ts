// api/health.ts     ← exact filename

// Standard Node.js API route
const apiHealthHandler = async (req: any, res: any) => {
  return res
    .status(200)
    .json({ status: "ok", timestamp: new Date().toISOString() });
};

export default apiHealthHandler;
