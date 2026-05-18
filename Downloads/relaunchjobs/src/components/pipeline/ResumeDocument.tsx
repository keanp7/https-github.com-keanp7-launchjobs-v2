import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer"

// ── Types ────────────────────────────────────────────────────────────────────
export interface ResumeData {
  full_name: string
  phone: string
  city_state: string
  headline: string
  experience_title: string
  professional_summary: string
  experience_bullets: string[]
  core_skills: string[]
  open_to: string[]
  years_experience?: number | null
  industry?: string
}

// ── Styles ───────────────────────────────────────────────────────────────────
const BLUE = "#2563EB"
const DARK = "#0F172A"
const GRAY = "#475569"
const LIGHT_GRAY = "#F1F5F9"
const RULE = "#CBD5E1"

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: DARK,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 42,
    lineHeight: 1.4,
  },
  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    marginBottom: 14,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    letterSpacing: 0.5,
  },
  contact: {
    fontSize: 8.5,
    color: GRAY,
    textAlign: "right",
  },
  headlineBar: {
    backgroundColor: BLUE,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 6,
    borderRadius: 2,
  },
  headlineText: {
    fontSize: 9,
    color: "white",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.3,
  },
  // ── Section ─────────────────────────────────────────────────────────────
  section: {
    marginBottom: 11,
  },
  sectionLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  rule: {
    borderBottomWidth: 0.75,
    borderBottomColor: RULE,
    marginBottom: 6,
  },
  // ── Summary ─────────────────────────────────────────────────────────────
  summaryText: {
    fontSize: 9.5,
    color: DARK,
    lineHeight: 1.5,
  },
  // ── Skills grid ─────────────────────────────────────────────────────────
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillChip: {
    backgroundColor: LIGHT_GRAY,
    borderRadius: 2,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 5,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 8.5,
    color: DARK,
  },
  // ── Experience ──────────────────────────────────────────────────────────
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  expTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },
  expMeta: {
    fontSize: 8.5,
    color: GRAY,
    textAlign: "right",
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 2,
  },
  bulletDot: {
    color: BLUE,
    fontSize: 9.5,
    marginRight: 5,
    marginTop: 0.5,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    color: DARK,
    lineHeight: 1.45,
  },
  // ── Open To ─────────────────────────────────────────────────────────────
  openToRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  openToItem: {
    fontSize: 8.5,
    color: GRAY,
    marginRight: 14,
    marginBottom: 3,
  },
  // ── Footer ──────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 18,
    left: 42,
    right: 42,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: "#94A3B8",
  },
})

// ── Component ────────────────────────────────────────────────────────────────
export function ResumeDocument({ data }: { data: ResumeData }) {
  const contactParts = [data.phone, data.city_state].filter(Boolean)

  return (
    <Document title={`${data.full_name} — Resume`} author="RelaunchJobs">
      <Page size="LETTER" style={s.page}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={s.nameRow}>
            <Text style={s.name}>{data.full_name}</Text>
            <Text style={s.contact}>{contactParts.join("  |  ")}</Text>
          </View>
          <View style={s.headlineBar}>
            <Text style={s.headlineText}>{data.headline}</Text>
          </View>
        </View>

        {/* ── Professional Summary ─────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Professional Summary</Text>
          <View style={s.rule} />
          <Text style={s.summaryText}>{data.professional_summary}</Text>
        </View>

        {/* ── Core Competencies ────────────────────────────────────────── */}
        {data.core_skills.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Core Competencies</Text>
            <View style={s.rule} />
            <View style={s.skillsGrid}>
              {data.core_skills.map((skill, i) => (
                <View key={i} style={s.skillChip}>
                  <Text style={s.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Professional Experience ──────────────────────────────────── */}
        {data.experience_bullets.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Professional Experience</Text>
            <View style={s.rule} />
            <View style={s.expHeader}>
              <Text style={s.expTitle}>{data.experience_title}</Text>
              <Text style={s.expMeta}>
                {data.years_experience ? `${data.years_experience}+ Years` : ""}
                {data.industry ? `  ·  ${data.industry}` : ""}
              </Text>
            </View>
            {data.experience_bullets.map((bullet, i) => (
              <View key={i} style={s.bullet}>
                <Text style={s.bulletDot}>▸</Text>
                <Text style={s.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Open To ──────────────────────────────────────────────────── */}
        {data.open_to.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Open To</Text>
            <View style={s.rule} />
            <View style={s.openToRow}>
              {data.open_to.map((item, i) => (
                <Text key={i} style={s.openToItem}>• {item}</Text>
              ))}
            </View>
          </View>
        )}

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Generated via RelaunchJobs</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          } />
        </View>

      </Page>
    </Document>
  )
}
