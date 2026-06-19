import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { TEMPLATE_THEME, TEMPLATE_STYLES } from "./templateConfig";

function buildStyles(theme) {
  return StyleSheet.create({
    page: {
      paddingTop: 48,
      paddingBottom: 48,
      paddingHorizontal: 52,
      fontFamily: theme.bodyFont,
      fontSize: 11,
      color: theme.textDark,
      lineHeight: 1.6,
    },
    header: {
      marginBottom: 28,
      borderBottomWidth: 1,
      borderBottomColor: theme.accent,
      paddingBottom: 14,
    },
    name: {
      fontFamily: theme.headerFont,
      fontSize: 20,
      color: theme.textDark,
      marginBottom: 4,
    },
    contactLine: {
      fontSize: 9,
      color: theme.textMuted,
    },
    date: {
      fontSize: 10,
      color: theme.textMuted,
      marginBottom: 16,
    },
    hiringLabel: {
      fontSize: 10,
      color: theme.textMuted,
      marginBottom: 4,
    },
    salutation: {
      fontFamily: theme.headerFont,
      fontSize: 11,
      marginBottom: 14,
      color: theme.textDark,
    },
    paragraph: {
      marginBottom: 12,
      fontSize: 11,
      lineHeight: 1.7,
      color: theme.textDark,
    },
    closing: {
      marginTop: 24,
      fontSize: 11,
      color: theme.textDark,
    },
    signature: {
      fontFamily: theme.headerFont,
      fontSize: 12,
      color: theme.accent,
      marginTop: 8,
    },
    accentBar: {
      width: 40,
      height: 3,
      backgroundColor: theme.accent,
      marginBottom: 14,
    },
  });
}

function cleanAndParse(text, candidateName) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const cleaned = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    // Skip lines that are duplicate header info the AI shouldn't have added
    if (/hiring manager/i.test(line) && line.length < 30) continue;
    if (/^\[date\]/i.test(line)) continue;
    if (/^\d{1,2}\s+\w+\s+\d{4}$/.test(line)) continue; // bare date line like "19 June 2026"
    // Skip standalone name lines that appear before "Sincerely"
    if (line === candidateName && cleaned.length > 0 && !cleaned.some(l => /^sincerely/i.test(l))) continue;
    cleaned.push(line);
  }

  // Now split into sections
  const salutationIdx = cleaned.findIndex(l => /^dear/i.test(l));
  const closingIdx = cleaned.findIndex(l => /^(sincerely|yours|regards|best)/i.test(l));

  const salutation = salutationIdx >= 0 ? cleaned[salutationIdx] : "Dear Hiring Manager,";

  // Body = lines between salutation and closing
  const bodyLines = cleaned.slice(
    salutationIdx >= 0 ? salutationIdx + 1 : 0,
    closingIdx >= 0 ? closingIdx : cleaned.length
  );

  // Merge body lines into paragraphs (split on empty gaps)
  const paragraphs = [];
  let current = [];
  for (const line of bodyLines) {
    if (line === "") {
      if (current.length) { paragraphs.push(current.join(" ")); current = []; }
    } else {
      current.push(line);
    }
  }
  if (current.length) paragraphs.push(current.join(" "));

  return { salutation, paragraphs };
}

export default function CoverLetterPdfDocument({ coverLetterText, candidate, templateStyle }) {
  const theme = TEMPLATE_THEME[templateStyle] || TEMPLATE_THEME[TEMPLATE_STYLES.MODERN_MINIMAL];
  const styles = buildStyles(theme);
  const { salutation, paragraphs } = cleanAndParse(coverLetterText, candidate.fullName);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric"
  });

  return (
    <Document title={`${candidate.fullName} - Cover Letter`} author="ResumeForge AI">
      <Page size="A4" style={styles.page}>
        {/* Header — name + contact */}
        <View style={styles.header}>
          <Text style={styles.name}>{candidate.fullName}</Text>
          <Text style={styles.contactLine}>
            {[candidate.email, candidate.phone, candidate.city].filter(Boolean).join("  ·  ")}
          </Text>
          {candidate.linkedIn ? (
            <Text style={styles.contactLine}>{candidate.linkedIn}</Text>
          ) : null}
        </View>

        {/* Date — added by component, not AI */}
        <Text style={styles.date}>{today}</Text>

        {/* Hiring Manager label — added by component, not AI */}
        <Text style={styles.hiringLabel}>Hiring Manager</Text>
        <View style={styles.accentBar} />

        {/* Salutation */}
        <Text style={styles.salutation}>{salutation}</Text>

        {/* Body paragraphs */}
        {paragraphs.map((para, idx) => (
          <Text key={idx} style={styles.paragraph}>{para}</Text>
        ))}

        {/* Closing — always exactly one name after Sincerely */}
        <View style={styles.closing}>
          <Text>Sincerely,</Text>
          <Text style={styles.signature}>{candidate.fullName}</Text>
        </View>
      </Page>
    </Document>
  );
}
