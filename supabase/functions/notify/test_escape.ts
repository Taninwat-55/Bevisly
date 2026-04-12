
function escapeHtml(str: string) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const testCases = [
  { input: "<b>Hello</b>", expected: "&lt;b&gt;Hello&lt;/b&gt;" },
  { input: '<script>alert("XSS")</script>', expected: "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;" },
  { input: "Smith & Co", expected: "Smith &amp; Co" },
  { input: "'OR 1=1--", expected: "&#039;OR 1=1--" },
  { input: '<img src=x onerror="alert(1)">', expected: "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;" },
];

let failed = false;
for (const { input, expected } of testCases) {
  const actual = escapeHtml(input);
  if (actual !== expected) {
    console.error(`FAIL: input="${input}", expected="${expected}", actual="${actual}"`);
    failed = true;
  } else {
    console.log(`PASS: input="${input}"`);
  }
}

if (failed) {
  Deno.exit(1);
} else {
  console.log("All tests passed!");
}
