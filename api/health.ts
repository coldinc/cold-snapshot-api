// api/health.ts
function health() {
  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
export {
  health as default
};
//# sourceMappingURL=health.js.map