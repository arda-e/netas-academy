export type SplCheckProvider = "sap_soap";

export type SplCheckDecision = "accepted" | "manual_review" | "rejected";

export type SplCheckResult = {
  provider: SplCheckProvider;
  decision: SplCheckDecision;
  statusCode: string | null;
  rawResponse?: string | null;
  errorReason?: string | null;
};

export type SplCheckRequest = {
  applicationNumber: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  tckn: string;
  courseDocumentId: string;
};

