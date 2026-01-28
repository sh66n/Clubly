// models/index.ts

// 1. Import the model constants directly from their files.
// This forces the execution of the mongoose.model() registration logic.
import { User } from "./user.model";
import { Club } from "./club.model";
import { Event } from "./event.model";
import { Group } from "./group.model";

// 2. Export them as a single block.
// When you import { Event } from "@/models" in your API,
// the engine is forced to load this entire file, ensuring
// that User, Club, and Group are registered before any .populate() runs.
export { User, Club, Event, Group };
