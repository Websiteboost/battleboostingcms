'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceForm } from '@/components/forms/ServiceForm';
import { updateService } from '@/app/actions/services';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Service, Category, Game } from '@/types';
import type { PriceComponent } from '@/types/priceComponents';

interface Props {
  service: Service & { priceComponents: PriceComponent[]; gameIds: string[] };
  categories: Category[];
  games: Game[];
}

export function EditServiceClient({ service, categories, games }: Props) {
  const router = useRouter();

  const handleSubmit = useCallback(async (formData: any) => {
    const result = await updateService({ ...formData, id: service.id });

    if (result.success) {
      toast.success('Servicio actualizado exitosamente', {
        duration: 3000,
        position: 'top-center',
      });
      router.push('/dashboard/services');
    } else {
      if ((result as any).details?.length) {
        (result as any).details.forEach((d: string) =>
          toast.error(d, { duration: 5000, position: 'top-center' })
        );
      } else {
        toast.error(result.error || 'Error al guardar', {
          duration: 4000,
          position: 'top-center',
        });
      }
      throw new Error(result.error || 'Error al guardar');
    }
  }, [service.id, router]);

  const handleCancel = useCallback(() => {
    router.push('/dashboard/services');
  }, [router]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleCancel}
          className="cursor-pointer flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Volver a Servicios</span>
        </button>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold neon-text">Editar Servicio</h1>
        <p className="text-sm text-gray-400 mt-0.5">{service.title}</p>
      </div>

      <div className="max-w-4xl">
        <ServiceForm
          key={service.id}
          initialData={{
            title: service.title,
            title_es: service.title_es ?? '',
            category_id: service.category_id,
            price: service.price,
            image: service.image,
            description: service.description,
            description_es: (service as any).description_es || [''],
            service_points: (service as any).service_points || [],
            service_points_es: (service as any).service_points_es || [''],
            priceComponents: service.priceComponents,
            gameIds: service.gameIds,
          }}
          categories={categories.map(c => ({ id: c.id, name: c.name }))}
          games={games}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditing={true}
        />
      </div>
    </div>
  );
}
