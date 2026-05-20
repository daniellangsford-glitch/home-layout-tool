import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProjectStore } from '../../stores/projectStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['floor', 'room', 'backyard', 'garage', 'custom']),
  viewMode: z.enum(['topDown', 'sideView']),
  unit: z.enum(['ft', 'in', 'm', 'cm']),
  width: z.coerce.number().positive('Must be > 0'),
  height: z.coerce.number().positive('Must be > 0'),
});

type FormData = z.infer<typeof schema>;

type Props = {
  onComplete: () => void;
};

export function PlanForm({ onComplete }: Props) {
  const createPlan = useProjectStore((s) => s.createPlan);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: '',
      type: 'floor',
      viewMode: 'topDown',
      unit: 'ft',
      width: 40,
      height: 30,
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    createPlan(data);
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <Input label="Plan Name" {...register('name')} error={errors.name?.message} placeholder="e.g. Main Floor" />
      <Select
        label="Type"
        options={[
          { value: 'floor', label: 'Floor Plan' },
          { value: 'room', label: 'Room' },
          { value: 'backyard', label: 'Backyard' },
          { value: 'garage', label: 'Garage' },
          { value: 'custom', label: 'Custom' },
        ]}
        {...register('type')}
      />
      <Select
        label="View Mode"
        options={[
          { value: 'topDown', label: 'Top-Down' },
          { value: 'sideView', label: 'Side View' },
        ]}
        {...register('viewMode')}
      />
      <Select
        label="Unit"
        options={[
          { value: 'ft', label: 'Feet (ft)' },
          { value: 'in', label: 'Inches (in)' },
          { value: 'm', label: 'Meters (m)' },
          { value: 'cm', label: 'Centimeters (cm)' },
        ]}
        {...register('unit')}
      />
      <div className="grid grid-cols-2 gap-2">
        <Input label="Width" type="number" step="0.1" {...register('width')} error={errors.width?.message} />
        <Input label="Height" type="number" step="0.1" {...register('height')} error={errors.height?.message} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" variant="primary">Create Plan</Button>
      </div>
    </form>
  );
}
