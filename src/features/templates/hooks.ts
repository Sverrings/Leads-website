// Shared with the iPhone app: Leads/src/features/templates/hooks.ts. Change both together.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';

import { useCurrentWorkspace } from '../workspace/WorkspaceProvider';
import {
  createTemplate,
  deleteTemplate,
  fetchTemplates,
  updateTemplate,
  type TemplateInput,
} from './api';

export function useTemplates() {
  const { workspace } = useCurrentWorkspace();
  return useQuery({
    queryKey: queryKeys.templates(workspace.id),
    queryFn: () => fetchTemplates(workspace.id),
  });
}

function useInvalidateTemplates() {
  const { workspace } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.templates(workspace.id) });
    // Steps embed template names.
    void queryClient.invalidateQueries({ queryKey: queryKeys.sequence(workspace.id) });
  };
}

export function useSaveTemplate(templateId: string | null) {
  const { workspace } = useCurrentWorkspace();
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: (input: TemplateInput) =>
      templateId ? updateTemplate(templateId, input) : createTemplate(workspace.id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteTemplate() {
  const invalidate = useInvalidateTemplates();
  return useMutation({ mutationFn: deleteTemplate, onSuccess: invalidate });
}
