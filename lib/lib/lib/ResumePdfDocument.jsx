import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { TEMPLATE_STYLES, TEMPLATE_THEME } from "./templateConfig";
import { parseResumeText, splitSectionIntoBlocks } from "./resumeParser";

function buildStyles(theme) {
  return StyleSheet.create({
    page: {
      paddingTop: 36,
      paddingBottom: 36,
      paddingHorizontal: 40,
      fontFamily: theme.bodyFont,
      fontSize: 10.5,
      color: theme.textDark,
    },
    pageTwoCol: {
      flexDirection: "row",
      paddingTop: 0,
      paddingBottom: 0,
      paddingHorizontal: 0,
      fontFamily: theme.bodyFont,
      fontSize: 10.5,
      color: theme.textDark,
    },
    sidebar: {
      width: "32%",
      backgroundColor: "#f4f3ff",
      paddingVertical: 36,
      paddingHorizontal: 20,
      minHeight: "100%",
    },
    mainCol: {
      width: "68%",
      paddingVertical: 36,
      paddingHorizontal: 28,
    },
    headerBlock: {
      marginBottom: 14,
    },
    name: {
      fontFamily: theme.headerFont,
      fontSize: 22,
      color: theme.textDark,
      marginBottom: 2,
    },
    role: {
      fontFamily: theme.bodyFont,
      fontSize: 12,
      color: theme.accent,
      marginBottom: 6,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    contactItem: {
      fontSize: 9,
      color: theme.textMuted,
      marginRight: 10,
    },
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: theme.accent,
      marginTop: 6,
      marginBottom: 14,
      opacity: 0.4,
    },
    sectionTitle: {
      fontFamily: theme.headerFont,
      fontSize: 11,
      color: theme.accent,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 6,
      marginTop: 12,
      borderBottomWidth: 0.75,
      borderBottomColor: theme.accent,
      paddingBottom: 3,
    },
    sidebarSectionTitle: {
      fontFamily: theme.headerFont,
      fontSize: 10,
      color: theme.accent,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 6,
      marginTop: 14,
    },
    bodyText: {
      fontSize: 10,
      color: theme.textDark,
      lineHeight: 1.5,
      marginBottom: 3,
    },
    sidebarText: {
      fontSize: 9,
      color: theme.textDark,
      lineHeight: 1.5,
      marginBottom: 4,
    },
    bulletRow: {
      flexDirection: "row",
      marginBottom: 3,
      paddingLeft: 2,
    },
    bulletDot: {
      width: 10,
      fontSize: 10,
      color: theme.accent,
    },
    bulletText: {
      flex: 1,
      fontSize: 10,
      lineHeight: 1.45,
      color: theme.textDark,
    },
    subHeaderLine: {
      fontFamily: theme.headerFont,
      fontSize: 10.5,
      color: theme.textDark,
      marginTop: 6,
      marginBottom: 2,
    },
    profileBox: {
      backgroundColor: "#f7f7fb",
      borderLeftWidth: 2,
      borderLeftColor: theme.accent,
      padding: 10,
      marginBottom: 10,
    },
  });
}

function SectionBody({ section, styles }) {
  const blocks = splitSectionIntoBlocks(section.lines);
  return (
    <View>
      {blocks.map((block, idx) => {
        if (block.type === "bullets") {
          return (
            <View key={idx}>
              {block.items.map((item, i) => (
                <View style={styles.bulletRow} key={i}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          );
        }
        const looksLikeSubHeader =
          block.text.length < 90 &&
          (block.text.includes("|") || /\d{4}/.test(block.text));
        return (
          <Text
            key={idx}
            style={looksLikeSubHeader ? styles.subHeaderLine : styles.bodyText}
          >
            {block.text}
          </Text>
        );
      })}
    </View>
  );
}

function HeaderBlock({ candidate, styles }) {
  return (
    <View style={styles.headerBlock}>
      <Text style={styles.name}>{candidate.fullName}</Text>
      {candidate.jobTitle ? <Text style={styles.role}>{candidate.jobTitle}</Text> : null}
      <View style={styles.contactRow}>
        {candidate.email ? <Text style={styles.contactItem}>{candidate.email}</Text> : null}
        {candidate.phone ? <Text style={styles.contactItem}>{candidate.phone}</Text> : null}
        {candidate.city ? <Text style={styles.contactItem}>{candidate.city}</Text> : null}
        {candidate.linkedIn ? <Text style={styles.contactItem}>{candidate.linkedIn}</Text> : null}
      </View>
      <View style={styles.divider} />
    </View>
  );
}

function SingleColumnResume({ candidate, parsed, styles, templateStyle }) {
  const isClassic = templateStyle === TEMPLATE_STYLES.CLASSIC_PROFESSIONAL;
  const summarySection = parsed.sections.find((s) => /SUMMARY|PROFILE/i.test(s.title));
  const otherSections = parsed.sections.filter((s) => s !== summarySection);

  return (
    <Page size="A4" style={styles.page}>
      <HeaderBlock candidate={candidate} styles={styles} />

      {summarySection &&
        (isClassic ? (
          <View style={styles.profileBox}>
            <Text
              style={[
                styles.sectionTitle,
                { marginTop: 0, borderBottomWidth: 0, paddingBottom: 0 },
              ]}
            >
              {summarySection.title}
            </Text>
            <SectionBody section={summarySection} styles={styles} />
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>{summarySection.title}</Text>
            <SectionBody section={summarySection} styles={styles} />
          </View>
        ))}

      {otherSections.map((section, idx) => (
        <View key={idx}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <SectionBody section={section} styles={styles} />
        </View>
      ))}
    </Page>
  );
}

function TwoColumnResume({ candidate, parsed, styles }) {
  const sidebarTitles = /SKILL|LANGUAGE|VISA|WORK AUTHORIZATION|PERSONAL|CERTIFICATION/i;
  const sidebarSections = parsed.sections.filter((s) => sidebarTitles.test(s.title));
  const mainSections = parsed.sections.filter((s) => !sidebarTitles.test(s.title));

  return (
    <Page size="A4" style={styles.pageTwoCol}>
      <View style={styles.sidebar}>
        <Text style={[styles.name, { fontSize: 17 }]}>{candidate.fullName}</Text>
        {candidate.jobTitle ? <Text style={styles.role}>{candidate.jobTitle}</Text> : null}

        <Text style={styles.sidebarSectionTitle}>Contact</Text>
        {candidate.email ? <Text style={styles.sidebarText}>{candidate.email}</Text> : null}
        {candidate.phone ? <Text style={styles.sidebarText}>{candidate.phone}</Text> : null}
        {candidate.city ? <Text style={styles.sidebarText}>{candidate.city}</Text> : null}
        {candidate.linkedIn ? <Text style={styles.sidebarText}>{candidate.linkedIn}</Text> : null}

        {sidebarSections.map((section, idx) => (
          <View key={idx}>
            <Text style={styles.sidebarSectionTitle}>{section.title}</Text>
            <SectionBody section={section} styles={styles} />
          </View>
        ))}
      </View>

      <View style={styles.mainCol}>
        {mainSections.map((section, idx) => (
          <View key={idx}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <SectionBody section={section} styles={styles} />
          </View>
        ))}
      </View>
    </Page>
  );
}

export default function ResumePdfDocument({ resumeText, candidate, templateStyle }) {
  const theme =
    TEMPLATE_THEME[templateStyle] || TEMPLATE_THEME[TEMPLATE_STYLES.MODERN_MINIMAL];
  const styles = buildStyles(theme);
  const parsed = parseResumeText(resumeText);

  return (
    <Document title={`${candidate.fullName} - Resume`} author="ResumeForge AI">
      {templateStyle === TEMPLATE_STYLES.GLOBAL_DETAILED ? (
        <TwoColumnResume candidate={candidate} parsed={parsed} styles={styles} />
      ) : (
        <SingleColumnResume
          candidate={candidate}
          parsed={parsed}
          styles={styles}
          templateStyle={templateStyle}
        />
      )}
    </Document>
  );
}
