import { jest } from "@jest/globals";
import { resolveLinkedRecordIds } from "../api/resolveLinkedRecordIds";
import { airtableSearch } from "../api/airtableSearch";

jest.mock("../api/airtableSearch", () => ({
  airtableSearch: jest.fn(),
}));

describe("resolveLinkedRecordIds", () => {
  it("converts display names to record ids", async () => {
    (airtableSearch as jest.Mock).mockResolvedValueOnce([{ id: "rec123" }]);
    const result = await resolveLinkedRecordIds("Contacts", {
      linkedLogs: ["Log A"],
    });
    expect(result.linkedLogs).toEqual(["rec123"]);
  });

  it("passes record ids through unchanged", async () => {
    (airtableSearch as jest.Mock).mockClear();
    const result = await resolveLinkedRecordIds("Contacts", {
      linkedLogs: ["rec12345678901234"],
    });
    expect(result.linkedLogs).toEqual(["rec12345678901234"]);
    expect(airtableSearch).not.toHaveBeenCalled();
  });
});
