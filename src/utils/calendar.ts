import { Opportunity } from '../types/campus';

export function getGoogleCalendarUrl(opp: Opportunity): string {
  try {
    // Format deadline as YYYYMMDD safely
    const cleanDate = (opp.deadline || '').replace(/[^0-9]/g, '').slice(0, 8) || '20261101';
    const startStr = `${cleanDate}T090000Z`;
    const endStr = `${cleanDate}T180000Z`;

    const details = `Ztopus Deadline Reminder: ${opp.title}\n\nHost: ${opp.host}\nEvent Dates: ${opp.eventDate}\nAward/Prize: ${opp.awardOrPrize || 'N/A'}\nEligibility: ${opp.eligibility}\n\nApplication / Official Link:\n${opp.applyUrl}\n\nOriginal Source:\n${opp.sourceUrl || opp.sourceName || 'Ztopus Radar'}`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `[Deadline] ${opp.title.replace(/[\r\n]+/g, ' ')}`,
      dates: `${startStr}/${endStr}`,
      details,
      location: (opp.location || 'Campus / Online').replace(/[\r\n]+/g, ' ')
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  } catch {
    return 'https://calendar.google.com';
  }
}

export function downloadIcsFile(opp: Opportunity) {
  const cleanDate = (opp.deadline || '').replace(/[^0-9]/g, '').slice(0, 8) || '20261101';
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ztopus//Student Opportunity Radar//EN',
    'BEGIN:VEVENT',
    `SUMMARY:[Deadline] ${opp.title.replace(/[\r\n]+/g, ' ')}`,
    `DESCRIPTION:${opp.description.replace(/\n/g, '\\n')}\\n\\nApply: ${opp.applyUrl}`,
    `LOCATION:${(opp.location || 'Campus / Online').replace(/[\r\n]+/g, ' ')}`,
    `URL:${opp.applyUrl}`,
    `DTSTART:${cleanDate}T090000Z`,
    `DTEND:${cleanDate}T180000Z`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${opp.id}-deadline.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
