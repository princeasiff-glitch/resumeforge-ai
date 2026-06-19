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

function splitIntoParagraphs(text) {
  return text
    .split(/\n{2,}/)
    .map(p => p.replace(/\n/g, " ").trim())
    .filter(p => p.length > 0);
}

export default function CoverLetterPdfDocument({ coverLetterText, candidate, templateStyle }) {
  const theme = TEMPLATE_THEME[templateStyle] || TEMPLATE_THEME[TEMPLATE_STYLES.MODERN_MINIMAL];
  const styles = buildStyles(theme);
  const paragraphs = splitIntoParagraphs(coverLetterText);

  const salutation = paragraphs.find(p => /^dear/i.test(p)) || "Dear Hiring Manager,";
  const closing = paragraphs.find(p => /^(yours|sincerely|regards|best)/i.test(p)) || "Sincerely,";
  const body = paragraphs.filter(p => p !== salutation && p !== closing);

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

        {body.map((para, idx) => (
          <Text key={idx} style={styles.paragraph}>{para}</Text>
        ))}

        <View style={styles.closing}>
          <Text>{closing}</Text>
          <Text style={styles.signature}>{candidate.fullName}</Text>
        </View>
      </Page>
    </Document>
  );
}
