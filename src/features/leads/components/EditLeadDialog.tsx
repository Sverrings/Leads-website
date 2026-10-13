'use client';

import type { LeadWithFollowUp } from '@/lib/models';
import { Button } from '@/ui/Button';
import { Dialog, DialogBody, DialogFooter } from '@/ui/Dialog';
import { useToast } from '@/ui/Toast';

import { isLeadLimitError } from '../../billing/plans';
import { useUpdateLead } from '../hooks';
import { toLeadInput, type LeadFormValues } from '../schemas';
import { LeadFields, useLeadForm } from './LeadForm';

function toFormValues(lead: LeadWithFollowUp): LeadFormValues {
  return {
    name: lead.name,
    email: lead.email ?? '',
    phone: lead.phone ?? '',
    company: lead.company ?? '',
    inquiry: lead.inquiry ?? '',
    source: lead.source ?? '',
    status: lead.status,
  };
}

type Props = {
  lead: LeadWithFollowUp;
  open: boolean;
  onClose: () => void;
  /** Reopening a Won/Lost lead hit the free plan's limit. */
  onLimit: () => void;
};

export function EditLeadDialog({ lead, open, onClose, onLimit }: Props) {
  return (
    <Dialog open={open} onClose={onClose} wide custom title="Edit lead">
      <EditLeadForm lead={lead} onClose={onClose} onLimit={onLimit} />
    </Dialog>
  );
}

/** Mounted each time the dialog opens, starting from the lead as it is now. */
function EditLeadForm({ lead, onClose, onLimit }: Omit<Props, 'open'>) {
  const toast = useToast();
  const update = useUpdateLead(lead.id);
  const form = useLeadForm(toFormValues(lead));

  const save = () => {
    const data = form.validate();
    if (!data) return;
    if (!form.dirty) return onClose();
    update.mutate(toLeadInput(data), {
      onSuccess: () => {
        toast.success('Changes saved');
        onClose();
      },
      onError: (error) => {
        if (isLeadLimitError(error)) {
          onClose();
          onLimit();
        } else {
          toast.error(error, 'Unable to save lead');
        }
      },
    });
  };

  return (
    <>
      <DialogBody>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
          noValidate>
          <LeadFields form={form} autoFocus />
          <button type="submit" hidden />
        </form>
      </DialogBody>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" loading={update.isPending} onClick={save}>
          Save changes
        </Button>
      </DialogFooter>
    </>
  );
}
