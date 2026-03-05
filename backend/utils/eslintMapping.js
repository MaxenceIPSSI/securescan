const eslintRuleToOwasp = {
  "no-eval": ["A05: Injection"],
  "no-implied-eval": ["A05: Injection"],
  "security/detect-object-injection": ["A05: Injection"],
  "no-unused-vars": ["A06: Insecure Design", "A10: Mishandling of Exceptional Conditions"],
  "no-inner-declarations": ["A06: Insecure Design"],
  "no-console": ["A10: Mishandling of Exceptional Conditions"],
  "consistent-return": ["A10: Mishandling of Exceptional Conditions"],
  "no-undef": ["A04: Cryptographic Failures"],
  "no-throw-literal": ["A10: Mishandling of Exceptional Conditions"],
  "prefer-const": ["A02: Security Misconfiguration"]
};

export function mapEslintToOwasp(ruleId) {
  if (!ruleId) return ["A06: Insecure Design"];
  return eslintRuleToOwasp[ruleId] || ["A06: Insecure Design"];
}