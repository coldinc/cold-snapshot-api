import { jest } from "@jest/globals";
import logEntriesHandler from "../api/log-entries-index";
import getAirtableContext from "../api/airtable_base";
import { getFieldMap } from "../api/resolveFieldMap";
import { airtableSearch } from "../api/airtableSearch";

jest.mock("../api/airtable_base");
jest.mock("../api/resolveFieldMap", () => {
  const actual = jest.requireActual("../api/resolveFieldMap");
  return {
    ...actual,
    getFieldMap: jest.fn(),
  };
});
jest.mock("../api/airtableSearch");

const json = jest.fn();
const status = jest.fn(() => ({ json }));
const res = { status } as any;

beforeEach(() => {
  jest.clearAllMocks();
});

it("honors limit parameter", async () => {
  (getAirtableContext as jest.Mock).mockReturnValue({
    TABLES: { LOGS: "Logs" },
    base: jest.fn(),
    airtableToken: "tok",
    baseId: "base",
  });
  (getFieldMap as jest.Mock).mockReturnValue({ summary: "Summary" });
  (airtableSearch as jest.Mock).mockResolvedValue({
    records: [{ id: "rec1", fields: { Summary: "hello" } }],
    offset: "next",
  });

  await logEntriesHandler({ method: "GET", query: { limit: "5" } } as any, res);

  expect(airtableSearch).toHaveBeenCalledWith("Logs", "", {
    maxRecords: 5,
    offset: undefined,
  });
  expect(status).toHaveBeenCalledWith(200);
  expect(json).toHaveBeenCalledWith({
    records: [{ id: "rec1", summary: "hello" }],
    offset: "next",
  });
});

it("strips unmapped fields and logs them on create", async () => {
  const create = jest.fn().mockResolvedValue([{ id: "rec1" }]);
  const base = jest.fn().mockReturnValue({ create });
  (getAirtableContext as jest.Mock).mockReturnValue({
    TABLES: { LOGS: "Logs" },
    base,
    airtableToken: "tok",
    baseId: "base",
  });
  (getFieldMap as jest.Mock).mockReturnValue({ summary: "Summary" });

  const consoleSpy = jest.spyOn(console, "log").mockImplementation();

  const body = {
    summary: "hello",
    linkedContactsId: "rec123",
    lastModified: "2024-06-01",
  };

  await logEntriesHandler({ method: "POST", body } as any, res);

  expect(create).toHaveBeenCalledWith([{ fields: { Summary: "hello" } }]);
  expect(consoleSpy).toHaveBeenCalledWith(
    "[scrubPayload] stripped fields for logs:",
    ["linkedContactsId", "lastModified"],
  );
  expect(status).toHaveBeenCalledWith(201);
  expect(json).toHaveBeenCalledWith({ id: "rec1", summary: "hello" });

  consoleSpy.mockRestore();
});
