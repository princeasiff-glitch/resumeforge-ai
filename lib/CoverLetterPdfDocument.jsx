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
  // Only extract content between "Dear..." and "Sincerely,"
  // Everything before "Dear" is discarded — AI headers, dates, names, "Hiring Manager" all gone
  const lines = text.split("\n").map(l => l.trim());

  const salutationIdx = lines.findIndex(l => /^dear/i.test(l));
  const closingIdx = lines.findIndex(l => /^(sincerely|yours|regards|best)/i.test(l));

  const salutation = salutationIdx >= 0
    ? lines[salutationIdx]
    : "Dear Hiring Manager,";

  // Body = only lines strictly between salutation and closing
  const start = salutationIdx >= 0 ? salutationIdx + 1 : 0;
  const end = closingIdx >= 0 ? closingIdx : lines.length;
  const bodyLines = lines.slice(start, end).filter(l => l.length > 0);

  // Merge into paragraphs
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
        <View style={styles.header}>
          <Text style={styles.name}>{candidate.fullName}</Text>
          <Text style={styles.contactLine}>
            {[candidate.email, candidate.phone, candidate.city].filter(Boolean).join("  ·  ")}
          </Text>
          {candidate.linkedIn ? (
            <Text style={styles.contactLine}>{candidate.linkedIn}</Text>
          ) : null}
        </View>

        <Text style={styles.date}>{today}</Text>
        <Text style={styles.hiringLabel}>Hiring Manager</Text>
        <View style={styles.accentBar} />
        <Text style={styles.salutation}>{salutation}</Text>

        {paragraphs.map((para, idx) => (
          <Text key={idx} style={styles.paragraph}>{para}</Text>
        ))}

        <View style={styles.closing}>
          <Text>Sincerely,</Text>
          <Text style={styles.signature}>{candidate.fullName}</Text>
        </View>
      </Page>
    </Document>
  );
}
