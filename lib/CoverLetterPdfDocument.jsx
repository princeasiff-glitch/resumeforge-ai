import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { TEMPLATE_THEME, TEMPLATE_STYLES } from "./templateConfig";

function buildStyles(theme) {
  return StyleSheet.create({
    page: {
      paddingTop: 48, paddingBottom: 48, paddingHorizontal: 52,
      fontFamily: theme.bodyFont, fontSize: 11, color: theme.textDark, lineHeight: 1.6,
    },
    header: {
      marginBottom: 24, borderBottomWidth: 1,
      borderBottomColor: theme.accent, paddingBottom: 12,
    },
    name: { fontFamily: theme.headerFont, fontSize: 20, color: theme.textDark, marginBottom: 4 },
    contactLine: { fontSize: 9, color: theme.textMuted },
    date: { fontSize: 10, color: theme.textMuted, marginBottom: 20 },
    salutation: { fontFamily: theme.headerFont, fontSize: 11, marginBottom: 14, color: theme.textDark },
    paragraph: { marginBottom: 12, fontSize: 11, lineHeight: 1.7, color: theme.textDark },
    closing: { marginTop: 24, fontSize: 11, color: theme.textDark },
    signature: { fontFamily: theme.headerFont, fontSize: 12, color: theme.accent, marginTop: 8 },
    accentLine: { width: 40, height: 3, backgroundColor: theme.accent, marginBottom: 16 },
  });
}

function extractBody(text) {
  const lines = text.split("\n");

  const dearIdx = lines.findIndex(l => /^\s*dear/i.test(l));
  const closeIdx = lines.findIndex(l => /^\s*(sincerely|yours truly|yours faithfully|regards|best regards|warm regards)/i.test(l));

  if (dearIdx === -1) {
    return { salutation: "Dear Hiring Manager,", paragraphs: lines.filter(l => l.trim()).map(l => l.trim()) };
  }

  const salutation = lines[dearIdx].trim();
  const end = closeIdx > dearIdx ? closeIdx : lines.length;
  const rawSlice = lines.slice(dearIdx + 1, end);

  const paragraphs = [];
  let current = [];
  for (const line of rawSlice) {
    const t = line.trim();
    if (t === "") {
      if (current.length > 0) { paragraphs.push(current.join(" ")); current = []; }
    } else {
      current.push(t);
    }
  }
  if (current.length > 0) paragraphs.push(current.join(" "));

  return { salutation, paragraphs };
}

export default function CoverLetterPdfDocument({ coverLetterText, candidate, templateStyle }) {
  const theme = TEMPLATE_THEME[templateStyle] || TEMPLATE_THEME[TEMPLATE_STYLES.MODERN_MINIMAL];
  const styles = buildStyles(theme);
  const { salutation, paragraphs } = extractBody(coverLetterText);

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
          {candidate.linkedIn ? <Text style={styles.contactLine}>{candidate.linkedIn}</Text> : null}
        </View>

        <Text style={styles.date}>{today}</Text>
        <View style={styles.accentLine} />
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
