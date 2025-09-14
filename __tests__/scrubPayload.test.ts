import { scrubPayload } from "../api/scrubPayload";

describe("scrubPayload", () => {
  it("removes read-only and unknown fields", async () => {
    const payload = {
      name: "Alice",
      id: "rec123",
      created: "2024-01-01",
      lastModified: "2024-02-01",
      extra: "ignore",
    };
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const cleaned = await scrubPayload("Contacts", payload);
    expect(cleaned).toEqual({ name: "Alice" });
    expect(logSpy).toHaveBeenCalledWith(
      "[scrubPayload] stripped fields for contacts:",
      ["id", "created", "lastModified", "extra"],
    );
    logSpy.mockRestore();
  });
});
