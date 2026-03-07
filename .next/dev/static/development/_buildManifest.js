self.__BUILD_MANIFEST = {
  "/": [
    "static/chunks/pages/index.js"
  ],
  "/auth/signin": [
    "static/chunks/pages/auth/signin.js"
  ],
  "__rewrites": {
    "afterFiles": [],
    "beforeFiles": [],
    "fallback": []
  },
  "sortedPages": [
    "/",
    "/_app",
    "/_error",
    "/api/assistant/chat-stream",
    "/api/assistant/feedback",
    "/api/auth/[...nextauth]",
    "/api/genomic/analyze-variant",
    "/api/genomic/analyze-variant-stream",
    "/api/patient-records",
    "/api/patient-records/[id]",
    "/api/patients",
    "/api/patients/[id]/recompute-risk",
    "/assistant",
    "/auth/signin",
    "/genomic"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()