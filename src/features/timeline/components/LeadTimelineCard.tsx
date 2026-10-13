'use client';

import { useState } from 'react';

import { Button } from '@/ui/Button';
import { Card, ErrorState, SkeletonRows } from '@/ui/Display';
import { TextArea } from '@/ui/Field';
import { useToast } from '@/ui/Toast';

import { useAddNote } from '../../follow-ups/hooks';
import detail from '../../leads/components/detail.module.css';
import { useLeadTimeline } from '../hooks';
import { LeadTimelineList } from './ActivityList';

/** A lead's history, newest first, with a quick note box on top. */
export function LeadTimelineCard({ leadId, now }: { leadId: string; now: Date }) {
  const toast = useToast();
  const timeline = useLeadTimeline(leadId);
  const addNote = useAddNote(leadId);
  const [note, setNote] = useState('');

  const save = () => {
    const body = note.trim();
    if (!body) return;
    addNote.mutate(body, {
      onSuccess: () => setNote(''),
      onError: (error) => toast.error(error, 'Unable to save note'),
    });
  };

  return (
    <Card title="History">
      <div className={detail.composer}>
        <TextArea
          aria-label="Note"
          placeholder="Add a note…"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) save();
          }}
          maxLength={2000}
        />
        <Button variant="primary" size="sm" onClick={save} loading={addNote.isPending} disabled={!note.trim()}>
          Add note
        </Button>
      </div>
      {timeline.isPending ? (
        <SkeletonRows rows={3} />
      ) : timeline.isError ? (
        <ErrorState title="Unable to load history" error={timeline.error} onRetry={() => void timeline.refetch()} />
      ) : (
        <LeadTimelineList events={timeline.data} now={now} />
      )}
    </Card>
  );
}
