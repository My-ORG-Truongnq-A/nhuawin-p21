import { documentTypes } from "./documents";
import { objectTypes } from "./objects";

export { SINGLETONS } from "./documents";
export const schemaTypes = [...objectTypes, ...documentTypes];
