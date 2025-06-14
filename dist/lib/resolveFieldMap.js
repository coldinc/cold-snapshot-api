"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lib/resolveFieldMap.ts
var resolveFieldMap_exports = {};
__export(resolveFieldMap_exports, {
  filterMappedFields: () => filterMappedFields,
  getFieldMap: () => getFieldMap
});
module.exports = __toCommonJS(resolveFieldMap_exports);
function getFieldMap(tableName) {
  switch (tableName) {
    case "Contacts":
      return {
        Name: "name",
        Role: "role",
        Organisation: "organisation",
        Email: "email",
        Tags: "tags",
        Notes: "notes"
      };
    case "Log Entries":
      return {
        Date: "date",
        Summary: "summary",
        Content: "content",
        Tags: "tags",
        "Log Type": "logType",
        Contacts: "contacts"
      };
    case "Snapshots":
      return {
        Title: "title",
        Date: "date",
        Content: "content",
        "Key Updates": "keyUpdates",
        "Phase ID": "phaseId"
      };
    case "Threads":
      return {
        Title: "title",
        Summary: "summary",
        Content: "content",
        Tags: "tags",
        Date: "date",
        Contacts: "contacts",
        Experiments: "experiments",
        Outputs: "outputs"
      };
    default:
      return {};
  }
}
function filterMappedFields(fields, tableName) {
  const fieldMap = getFieldMap(tableName);
  const mapped = {};
  for (const key in fields) {
    if (fieldMap[key]) {
      mapped[fieldMap[key]] = fields[key];
    }
  }
  return mapped;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  filterMappedFields,
  getFieldMap
});
//# sourceMappingURL=resolveFieldMap.js.map