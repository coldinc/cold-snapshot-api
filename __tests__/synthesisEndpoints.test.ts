import { jest } from "@jest/globals";
import synthesizeSnapshotHandler from "../api/snapshots-synthesize-current-state";
import synthesizeThreadHandler from "../api/synthesize-thread";
import getAirtableContext from "../api/airtable_base";
import { getFieldMap, filterMappedFields } from "../api/resolveFieldMap";
import { buildSynthesisPrompt, runGPTSynthesis } from "../api/synthesisUtils";

jest.mock("../api/airtable_base");
jest.mock("../api/resolveFieldMap");
jest.mock("../api/synthesisUtils");

const json = jest.fn();
const status = jest.fn(() => ({ json }));
const res = { status } as any;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("snapshots-synthesize-current-state", () => {
  it("returns filtered latest snapshot", async () => {
    const all = jest
      .fn()
      .mockResolvedValue([{ id: "rec1", fields: { foo: "bar" } }]);
    const select = jest.fn(() => ({ all }));
    (getAirtableContext as jest.Mock).mockReturnValue({
      base: jest.fn(() => ({ select })),
      TABLES: { SNAPSHOTS: "Snapshots" },
    });
    (getFieldMap as jest.Mock).mockReturnValue({ foo: "Foo" });
    (filterMappedFields as jest.Mock).mockReturnValue({ Foo: "bar" });

    await synthesizeSnapshotHandler({} as any, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ Foo: "bar" });
  });

  it("returns 404 when no snapshots found", async () => {
    const all = jest.fn().mockResolvedValue([]);
    const select = jest.fn(() => ({ all }));
    (getAirtableContext as jest.Mock).mockReturnValue({
      base: jest.fn(() => ({ select })),
      TABLES: { SNAPSHOTS: "Snapshots" },
    });

    await synthesizeSnapshotHandler({} as any, res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ error: "No snapshots found" });
  });
});

describe("synthesize-thread", () => {
  const fetchMock = jest.fn();
  global.fetch = fetchMock as any;

  it("returns 400 if threadId missing", async () => {
    await synthesizeThreadHandler({ method: "POST", body: {} } as any, res);
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: "Missing threadId" });
  });

  it("returns synthesis result", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "t1", fields: {} }),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "log1" }),
      });
    (buildSynthesisPrompt as jest.Mock).mockReturnValue({
      systemPrompt: "",
      userPrompt: "",
    });
    (runGPTSynthesis as jest.Mock).mockResolvedValue("text");

    await synthesizeThreadHandler(
      { method: "POST", body: { threadId: "t1" } } as any,
      res,
    );

    expect(buildSynthesisPrompt).toHaveBeenCalled();
    expect(runGPTSynthesis).toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      synthesis: "text",
      synthesisLog: { id: "log1" },
    });
  });
});
