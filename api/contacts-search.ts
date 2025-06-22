import getAirtableContext from "./airtable_base.js";
import { createDynamicSearchHandler } from "./dynamicSearchHandler.js";

const { TABLES } = getAirtableContext();

export default createDynamicSearchHandler(TABLES.CONTACTS);
