import { setGlobalOptions } from "firebase-functions/v2";

// Set region for all functions
setGlobalOptions({ region: "us-central1" });

export { verifyParentPin } from "./pins/verifyParentPin";
export { revokeParentAccess } from "./pins/revokeParentAccess";
