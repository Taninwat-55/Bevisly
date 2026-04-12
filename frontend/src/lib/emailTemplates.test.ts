import { describe, it, expect } from "vitest";
import {
  getAdminNotificationTemplate,
  getContactMessageTemplate,
  getUserConfirmationTemplate,
} from "./emailTemplates";

describe("emailTemplates", () => {
  describe("getAdminNotificationTemplate", () => {
    it("should include name, email and request type", () => {
      const name = "John Doe";
      const email = "john@example.com";
      const type = "Contact";
      const result = getAdminNotificationTemplate(name, email, "N/A", type);

      expect(result).toContain(name);
      expect(result).toContain(email);
      expect(result).toContain(`New ${type} Request`);
      expect(result).toContain(`mailto:${email}`);
    });

    it("should handle default company value", () => {
      const result = getAdminNotificationTemplate("John", "john@example.com", undefined, "Beta Access");
      expect(result).toContain("Company");
      expect(result).toContain("N/A");
    });

    it("should handle custom company value", () => {
      const company = "Acme Corp";
      const result = getAdminNotificationTemplate("John", "john@example.com", company, "Beta Access");
      expect(result).toContain("Company");
      expect(result).toContain(company);
    });

    it("should not show company section if company is empty string", () => {
      const result = getAdminNotificationTemplate("John", "john@example.com", "", "Beta Access");
      expect(result).not.toContain("Company");
    });
  });

  describe("getContactMessageTemplate", () => {
    it("should include name, email and message", () => {
      const name = "Jane Doe";
      const email = "jane@example.com";
      const message = "Hello, I have a question.";
      const result = getContactMessageTemplate(name, email, message);

      expect(result).toContain(`New Message from ${name}`);
      expect(result).toContain(name);
      expect(result).toContain(email);
      expect(result).toContain(message);
    });
  });

  describe("getUserConfirmationTemplate", () => {
    it("should include the user name", () => {
      const name = "Bob";
      const result = getUserConfirmationTemplate(name);
      expect(result).toContain(`Hi ${name},`);
    });

    it("should include the current year in the footer", () => {
      const currentYear = new Date().getFullYear().toString();
      const result = getUserConfirmationTemplate("Bob");
      expect(result).toContain(`© ${currentYear} Bevisly. All rights reserved.`);
    });
  });
});
