import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CATEGORIES, LIMITS } from '@/constants';
import { promptFormSchema, type PromptFormValues } from './promptFormSchema';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { closeFormModal } from '@/features/ui/uiSlice';
import { createPrompt, updatePrompt } from '@/features/prompts/promptsSlice';

const parseTags = (input: string): string[] =>
  input
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .filter((t, i, arr) => arr.findIndex((x) => x.toLowerCase() === t.toLowerCase()) === i)
    .slice(0, LIMITS.MAX_TAGS);

export const PromptFormModal = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isFormModalOpen);
  const editingPrompt = useAppSelector((state) => state.ui.editingPrompt);
  const isEditMode = Boolean(editingPrompt);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PromptFormValues>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: {
      title: '',
      content: '',
      description: '',
      category: 'Coding',
      tagsInput: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: editingPrompt?.title ?? '',
        content: editingPrompt?.content ?? '',
        description: editingPrompt?.description ?? '',
        category: editingPrompt?.category ?? 'Coding',
        tagsInput: editingPrompt?.tags.join(', ') ?? '',
      });
    }
  }, [isOpen, editingPrompt, reset]);

  const contentValue = watch('content') ?? '';
  const titleValue = watch('title') ?? '';

  const onSubmit = async (values: PromptFormValues) => {
    const payload = {
      title: values.title.trim(),
      content: values.content.trim(),
      description: values.description?.trim() || '',
      category: values.category,
      tags: parseTags(values.tagsInput ?? ''),
    };

    if (isEditMode) {
      const result = await dispatch(updatePrompt({ id: editingPrompt!.id, input: payload }));
      if (updatePrompt.fulfilled.match(result)) {
        toast.success('Prompt updated');
        dispatch(closeFormModal());
      } else {
        toast.error(result.payload || 'Something went wrong');
      }
    } else {
      const result = await dispatch(createPrompt(payload));
      if (createPrompt.fulfilled.match(result)) {
        toast.success('Prompt created');
        dispatch(closeFormModal());
      } else {
        toast.error(result.payload || 'Something went wrong');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => dispatch(closeFormModal())}
      title={isEditMode ? 'Edit prompt' : 'New prompt'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={() => dispatch(closeFormModal())} type="button">
            Cancel
          </Button>
          <Button type="submit" form="prompt-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Create prompt'}
          </Button>
        </>
      }
    >
      <form id="prompt-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Title" htmlFor="title" required error={errors.title?.message} hint={`${titleValue.length}/${LIMITS.TITLE_MAX}`}>
          <Input id="title" hasError={!!errors.title} placeholder="e.g. SQL query optimizer" {...register('title')} />
        </Field>

        <Field label="Category" htmlFor="category" required error={errors.category?.message}>
          <Select id="category" hasError={!!errors.category} {...register('category')}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Prompt content"
          htmlFor="content"
          required
          error={errors.content?.message}
          hint={`${contentValue.length}/${LIMITS.CONTENT_MAX}`}
        >
          <Textarea
            id="content"
            hasError={!!errors.content}
            rows={6}
            placeholder="Write the actual prompt text here..."
            className="font-mono text-xs"
            {...register('content')}
          />
        </Field>

        <Field label="Description" htmlFor="description" error={errors.description?.message} hint="Optional short note about when to use this prompt">
          <Textarea
            id="description"
            hasError={!!errors.description}
            rows={2}
            placeholder="What is this prompt for?"
            {...register('description')}
          />
        </Field>

        <Field label="Tags" htmlFor="tagsInput" hint="Comma-separated, e.g. sql, optimization, postgres">
          <Input id="tagsInput" placeholder="tag-one, tag-two" {...register('tagsInput')} />
        </Field>
      </form>
    </Modal>
  );
};
