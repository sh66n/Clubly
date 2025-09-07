// models/index.ts
// Import models in dependency order to avoid circular references

// Base models first (no dependencies)
import "./user.model";

// Then models that depend on base models
import "./club.model";
import "./event.model";

import "./group.model";

// Export all models
export { User } from "./user.model";
export { Club } from "./club.model";
export { Event } from "./event.model";
export { Group } from "./group.model";
