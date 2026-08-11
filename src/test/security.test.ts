import { describe, it, expect } from "vitest";
import { sanitizeInput, validateEmail, sanitizePhone, isSafeParam } from "@/lib/security";

describe("Security & Input Sanitization Suite", () => {
  it("should strip malicious XSS script tags and HTML entities", () => {
    const maliciousInput = "<script>alert('xss')</script>";
    const sanitized = sanitizeInput(maliciousInput);
    expect(sanitized).not.toContain("<script>");
    expect(sanitized).toBe("&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;");
  });

  it("should validate legitimate email formats and reject bad emails", () => {
    expect(validateEmail("user@houseofnuts.com")).toBe(true);
    expect(validateEmail("customer.name@gmail.co.in")).toBe(true);
    expect(validateEmail("invalid-email")).toBe(false);
    expect(validateEmail("user@<script>")).toBe(false);
  });

  it("should sanitize phone numbers", () => {
    expect(sanitizePhone("+91 98765-43210")).toBe("+91 98765-43210");
    expect(sanitizePhone("<script>+919876543210</script>")).toBe("+919876543210");
  });

  it("should detect dangerous payload patterns", () => {
    expect(isSafeParam("Normal text input")).toBe(true);
    expect(isSafeParam("DROP TABLE Users;")).toBe(false);
    expect(isSafeParam("javascript:alert(1)")).toBe(false);
  });
});
