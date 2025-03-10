import { linkFiber } from "./linkFiber";
import type { Status } from "./types";

const mode: Status = {
  jumping: false,
};

const linkFiberInit = linkFiber(mode);

linkFiberInit();
