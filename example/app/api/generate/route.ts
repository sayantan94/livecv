import { createHandler } from "livecv";
import config from "@/livecv.config";

export const maxDuration = 60;
export const POST = createHandler({ config });
