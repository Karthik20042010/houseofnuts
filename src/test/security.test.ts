import { describe, it, expect } from "vitest";
import { sanitizeInput, validateEmail, sanitizePhone, isSafeParam } from "@/lib/security";
import { obfuscatePayload, deobfuscatePayload } from "@/lib/encryption";

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

  it("should obfuscate and de-obfuscate API payloads securely", () => {
    const originalPayload = { action: "updateProductPrice", productId: "mamra-almonds", newPrice: 599 };
    const scrambled = obfuscatePayload(originalPayload);
    expect(typeof scrambled).toBe("string");
    expect(scrambled).not.toContain("updateProductPrice");
    expect(scrambled).not.toContain("mamra-almonds");

    const decoded = deobfuscatePayload<typeof originalPayload>(scrambled);
    expect(decoded.action).toBe("updateProductPrice");
    expect(decoded.productId).toBe("mamra-almonds");
    expect(decoded.newPrice).toBe(599);
  });
});
