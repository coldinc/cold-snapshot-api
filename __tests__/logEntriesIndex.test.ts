import { jest } from "@jest/globals";
import logEntriesHandler from "../api/log-entries-index";
import getAirtableContext from "../api/airtable_base";
import { getFieldMap } from "../api/resolveFieldMap";
import { airtableSearch } from "../api/airtableSearch";

jest.mock("../api/airtable_base");
jest.mock("../api/resolveFieldMap");
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
