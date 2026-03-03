/**
 * Resume Export — generates a theme-styled PDF from config data using jsPDF.
 * Lazy-loads jsPDF on first click. Reads CSS custom properties for theme colors.
 */

function getThemeColor(prop: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(prop).trim() || '#00bfbf';
}

function hexFromColor(color: string): string {
  // Handle var() references or plain hex/rgb
  if (color.startsWith('#')) return color;
  if (color.startsWith('rgb')) {
    const match = color.match(/(\d+)/g);
    if (match && match.length >= 3) {
      return (
        '#' +
        match
          .slice(0, 3)
          .map((n) => parseInt(n, 10).toString(16).padStart(2, '0'))
          .join('')
      );
    }
  }
  return '#00bfbf';
}

interface ResumeData {
  name: string;
  title: string;
  location: string;
  experience: string;
  arsenal: { key: string; value: string }[];
  missionLog: string[];
  jobs: { role: string; company: string; date: string; achievements: string[]; tags: string[] }[];
  certifications: { name: string; issuer: string }[];
  socials?: { platform: string; label: string; url: string }[];
}

import { trackEvent } from '../achievements';

export function initResumeExport(): void {
  const btn = document.getElementById('resumeExportBtn');
  if (!btn) return;

  const dataEl = document.getElementById('resumeData');
  if (!dataEl) return;

  let data: ResumeData;
  try {
    data = JSON.parse(dataEl.textContent || '{}');
  } catch {
    return;
  }

  btn.addEventListener('click', async () => {
    btn.classList.add('loading');

    try {
      const { jsPDF } = await import('jspdf');

      const accent = hexFromColor(getThemeColor('--accent'));
      const textColor = '#333333';
      const dimColor = '#666666';

      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      function checkPage(need: number): void {
        if (y + need > 280) {
          doc.addPage();
          y = margin;
        }
      }

      // Header
      doc.setFontSize(22);
      doc.setTextColor(accent);
      doc.text(data.name, margin, y);
      y += 8;

      doc.setFontSize(11);
      doc.setTextColor(dimColor);
      doc.text(`${data.title} | ${data.location} | ${data.experience}`, margin, y);
      y += 6;

      // Socials
      if (data.socials && data.socials.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(accent);
        const socialLine = data.socials.map((s) => `${s.label}: ${s.url}`).join('  |  ');
        const socialLines = doc.splitTextToSize(socialLine, contentWidth);
        doc.text(socialLines, margin, y);
        y += socialLines.length * 3.5 + 2;
      }
      y += 2;

      // Divider
      doc.setDrawColor(accent);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      // Skills
      doc.setFontSize(12);
      doc.setTextColor(accent);
      doc.text('TECHNICAL SKILLS', margin, y);
      y += 6;

      doc.setFontSize(9);
      for (const item of data.arsenal) {
        checkPage(6);
        doc.setTextColor(textColor);
        doc.text(`${item.key.replace(/_/g, ' ').toUpperCase()}:`, margin, y);
        doc.setTextColor(dimColor);
        doc.text(item.value, margin + 35, y);
        y += 5;
      }
      y += 4;

      // Key Achievements
      doc.setFontSize(12);
      doc.setTextColor(accent);
      checkPage(10);
      doc.text('KEY ACHIEVEMENTS', margin, y);
      y += 6;

      doc.setFontSize(9);
      doc.setTextColor(textColor);
      for (const log of data.missionLog) {
        checkPage(6);
        const lines = doc.splitTextToSize(`• ${log}`, contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 4.5;
      }
      y += 4;

      // Experience
      doc.setFontSize(12);
      doc.setTextColor(accent);
      checkPage(10);
      doc.text('EXPERIENCE', margin, y);
      y += 6;

      for (const job of data.jobs) {
        checkPage(20);

        doc.setFontSize(10);
        doc.setTextColor(textColor);
        doc.text(job.role, margin, y);

        doc.setFontSize(8);
        doc.setTextColor(dimColor);
        const dateText = job.date.replace(/&mdash;/g, '—').replace(/&middot;/g, '·');
        doc.text(dateText, pageWidth - margin, y, { align: 'right' });
        y += 4.5;

        doc.setFontSize(9);
        doc.setTextColor(accent);
        doc.text(job.company, margin, y);
        y += 5;

        doc.setFontSize(8);
        doc.setTextColor(textColor);
        for (const ach of job.achievements.slice(0, 4)) {
          checkPage(6);
          const clean = ach
            .replace(/&amp;/g, '&')
            .replace(/&mdash;/g, '—')
            .replace(/&rarr;/g, '→');
          const lines = doc.splitTextToSize(`• ${clean}`, contentWidth - 2);
          doc.text(lines, margin + 2, y);
          y += lines.length * 4;
        }
        y += 3;
      }

      // Certifications
      if (data.certifications.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(accent);
        checkPage(10);
        doc.text('CERTIFICATIONS', margin, y);
        y += 6;

        doc.setFontSize(8);
        for (const cert of data.certifications.slice(0, 6)) {
          checkPage(5);
          doc.setTextColor(textColor);
          const clean = cert.name.replace(/&amp;/g, '&');
          const issuerClean = cert.issuer.replace(/&middot;/g, '·');
          doc.text(`• ${clean} — ${issuerClean}`, margin, y);
          y += 4.5;
        }
      }

      doc.save(`${data.name.replace(/\s+/g, '_')}_Resume.pdf`);
      trackEvent('resume_export');
    } catch (err) {
      console.error('[resume-export] Failed:', err);
    } finally {
      btn.classList.remove('loading');
    }
  });
}
