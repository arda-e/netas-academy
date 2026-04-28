/* ─── Analytics event contract for lead-flow behavior ─── */

type LeadType = string;

/* ─── Core event types ─── */

export interface LeadTabViewEvent {
  eventName: "lead_tab_view";
  properties: { leadType: LeadType };
}

export interface LeadTabChangeEvent {
  eventName: "lead_tab_change";
  properties: { from: LeadType; to: LeadType };
}

export interface LeadFormStartEvent {
  eventName: "lead_form_start";
  properties: { leadType: LeadType };
}

export interface LeadSubmitSuccessEvent {
  eventName: "lead_submit_success";
  properties: { leadType: LeadType };
}

export interface LeadSubmitFailEvent {
  eventName: "lead_submit_fail";
  properties: { leadType: LeadType; reason: string };
}

export interface LeadContextualEntryEvent {
  eventName: "lead_contextual_entry";
  properties: { leadType: LeadType };
}

export interface LeadCatalogClickEvent {
  eventName: "lead_catalog_click";
  properties: { leadType: LeadType };
}

export interface LeadRelatedContentClickEvent {
  eventName: "lead_related_content_click";
  properties: { leadType: LeadType };
}

export type LeadAnalyticsEvent =
  | LeadTabViewEvent
  | LeadTabChangeEvent
  | LeadFormStartEvent
  | LeadSubmitSuccessEvent
  | LeadSubmitFailEvent
  | LeadContextualEntryEvent
  | LeadCatalogClickEvent
  | LeadRelatedContentClickEvent;

/* ─── Swappable backend interface ─── */

export interface AnalyticsBackend {
  emit(event: LeadAnalyticsEvent): void;
}

/* ─── Console (noop) backend — replace with real vendor later ─── */

const consoleBackend: AnalyticsBackend = {
  emit(event: LeadAnalyticsEvent) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log("[analytics]", event.eventName, event.properties);
    }
  },
};

let activeBackend: AnalyticsBackend = consoleBackend;

export function setAnalyticsBackend(backend: AnalyticsBackend): void {
  activeBackend = backend;
}

export function getAnalyticsBackend(): AnalyticsBackend {
  return activeBackend;
}

/* ─── Public emit helper ─── */

function emit(event: LeadAnalyticsEvent): void {
  activeBackend.emit(event);
}

/* ─── Typed event helpers ─── */

export function emitLeadTabView(leadType: LeadType): void {
  emit({ eventName: "lead_tab_view", properties: { leadType } });
}

export function emitLeadTabChange(from: LeadType, to: LeadType): void {
  emit({ eventName: "lead_tab_change", properties: { from, to } });
}

export function emitLeadFormStart(leadType: LeadType): void {
  emit({ eventName: "lead_form_start", properties: { leadType } });
}

export function emitLeadSubmitSuccess(leadType: LeadType): void {
  emit({ eventName: "lead_submit_success", properties: { leadType } });
}

export function emitLeadSubmitFail(leadType: LeadType, reason: string): void {
  emit({ eventName: "lead_submit_fail", properties: { leadType, reason } });
}

export function emitLeadContextualEntry(leadType: LeadType): void {
  emit({ eventName: "lead_contextual_entry", properties: { leadType } });
}

export function emitLeadCatalogClick(leadType: LeadType): void {
  emit({ eventName: "lead_catalog_click", properties: { leadType } });
}

export function emitLeadRelatedContentClick(leadType: LeadType): void {
  emit({ eventName: "lead_related_content_click", properties: { leadType } });
}
