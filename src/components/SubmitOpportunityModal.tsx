import React, { useState } from 'react';
import { X, PlusCircle, CheckCircle2 } from 'lucide-react';
import { Opportunity, OpportunityCategory, EventFormat } from '../types/campus';

interface SubmitOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newOpp: Opportunity) => void;
}

export const SubmitOpportunityModal: React.FC<SubmitOpportunityModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [host, setHost] = useState('');
  const [category, setCategory] = useState<OpportunityCategory>('hackday');
  const [format, setFormat] = useState<EventFormat>('Hybrid');
  const [location, setLocation] = useState('Campus Student Center');
  const [deadline, setDeadline] = useState('2026-11-01');
  const [eventDate, setEventDate] = useState('Nov 5–7, 2026');
  const [awardOrPrize, setAwardOrPrize] = useState('');
  const [eligibility, setEligibility] = useState('Open to all students');
  const [description, setDescription] = useState('');
  const [applyUrl, setApplyUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('hackathon, campus, beginner-friendly');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !host.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const newOpp: Opportunity = {
      id: `custom-opp-${Date.now()}`,
      title: title.trim(),
      host: host.trim(),
      category,
      format,
      location: location.trim(),
      deadline,
      eventDate: eventDate.trim(),
      awardOrPrize: awardOrPrize.trim() || undefined,
      eligibility: eligibility.trim(),
      description: description.trim() || 'No description provided.',
      tags: tags.length > 0 ? tags : ['campus', 'student'],
      applyUrl: applyUrl.trim() || 'https://university.edu/events',
      isOfficialCampusEvent: false,
      userSubmitted: true
    };

    onSubmit(newOpp);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-semibold text-white">Post Student Opportunity</h2>
              <p className="text-xs text-slate-400">Share a campus hackday, scholarship, or club event</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {submittedSuccess ? (
          <div className="p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-white">Opportunity Published!</h3>
            <p className="text-xs text-slate-400">
              Your event is now live on the Ztopus opportunity radar.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Event or Opportunity Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bioinfo Fall Hackday 2026 or Undergrad Research Grant"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Hosting Organization *</label>
                <input
                  type="text"
                  required
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="e.g. Student ACM Chapter"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as OpportunityCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="hackday">Hackday / Hackathon</option>
                  <option value="scholarship">Scholarship / Grant</option>
                  <option value="university-event">University Event</option>
                  <option value="internship">Research / Internship</option>
                  <option value="workshop">Campus Workshop</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Application Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Event Date</label>
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="e.g. Nov 5-7, 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as EventFormat)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="In-Person">In-Person</option>
                  <option value="Virtual">Virtual</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Science Building Lab 2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Prize / Award / Benefit (Optional)</label>
              <input
                type="text"
                value={awardOrPrize}
                onChange={(e) => setAwardOrPrize(e.target.value)}
                placeholder="e.g. $2,000 Prize Pool, Free Pizza, Mentorship"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Eligibility</label>
              <input
                type="text"
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
                placeholder="e.g. All enrolled undergrad students"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about the schedule, tracks, or requirements..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Registration / Apply URL</label>
              <input
                type="url"
                value={applyUrl}
                onChange={(e) => setApplyUrl(e.target.value)}
                placeholder="https://yourclub.org/register"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors"
              >
                Publish Opportunity
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
