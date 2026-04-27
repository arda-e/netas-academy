import type { CourseApplicationNotificationPayload } from "../../../src/services/internal-notifications/types";

describe("Course Application Notification Payload", () => {
  describe("TCKN masking", () => {
    it("should mask TCKN in student field", () => {
      const payload: CourseApplicationNotificationPayload = {
        applicationId: 123,
        applicationNumber: "CA-20231201123000-ABCDEF123456",
        course: {
          documentId: "course-doc-1",
          title: "Test Course",
          slug: "test-course",
        },
        student: {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "+905551234567",
          tckn: "12345678901", // Raw TCKN should not appear in notifications
        },
        status: "submitted",
        nextAction: "wait",
        paymentUrl: null,
      };

      // Check that TCKN is masked (contains stars)
      expect(payload.student.tckn).toMatch(/^\*{6,}\d{4}$/);
      // Original TCKN should not appear in the payload
      expect(payload.student.tckn).not.toEqual("12345678901");
    });

    it("should handle short TCKN values correctly", () => {
      const payload: CourseApplicationNotificationPayload = {
        applicationId: 123,
        applicationNumber: "CA-20231201123000-ABCDEF123456",
        course: {
          documentId: "course-doc-1",
          title: "Test Course",
          slug: "test-course",
        },
        student: {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "+905551234567",
          tckn: "123", // Short TCKN
        },
        status: "submitted",
        nextAction: "wait",
        paymentUrl: null,
      };

      // Short TCKNs should be fully masked
      expect(payload.student.tckn).toBe("****");
    });

    it("should handle missing TCKN correctly", () => {
      const payload: CourseApplicationNotificationPayload = {
        applicationId: 123,
        applicationNumber: "CA-20231201123000-ABCDEF123456",
        course: {
          documentId: "course-doc-1",
          title: "Test Course",
          slug: "test-course",
        },
        student: {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "+905551234567",
          tckn: "", 
        },
        status: "submitted",
        nextAction: "wait",
        paymentUrl: null,
      };

      // Empty TCKN should be fully masked
      expect(payload.student.tckn).toBe("****");
    });
  });
});
