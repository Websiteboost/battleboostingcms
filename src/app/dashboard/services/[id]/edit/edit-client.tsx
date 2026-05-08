'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceForm } from '@/components/forms/ServiceForm';
import { updateService, moveServiceToPosition } from '@/app/actions/services';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Service, Category, Game } from '@/types';
import type { PriceComponent } from '@/types/priceComponents';

interface Props {
  service: Service & { priceComponents: PriceComponent[]; gameIds: string[] };
  categories: Category[];
  games: Game[];
  totalServices: number;
}

export function EditServiceClient({ service, categories, games, totalServices }: Props) {
  const router = useRouter();
  const originalOrder = (service as any).display_order as number ?? 1;
  const [displayOrder, setDisplayOrder] = useState<number>(originalOrder);

  const handleOrderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!val) return;
    setDisplayOrder(Math.max(1, Math.min(totalServices, Math.round(val))));
  }, [totalServices]);

  const handleSubmit = useCallback(async (formData: any) => {
    const result = await updateService({ ...formData, id: service.id });

    if (result.success) {
      // Si el orden cambió, moverlo a la nueva posición
      if (displayOrder !== originalOrder) {
        const moveResult = await moveServiceToPosition(service.id, displayOrder);
        if (!moveResult.success) {
          toast.error(moveResult.error || 'Error al actualizar la posición', {
            duration: 4000,
            position: 'top-center',
          });
          // El servicio sí se actualizó, así que continuamos de todas formas
        }
      }

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
  }, [service.id, router, displayOrder, originalOrder]);

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

      <div className="max-w-4xl space-y-4 sm:space-y-6">
        {/* Posición en la lista */}
        <Card className="p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Hash size={15} className="text-cyber-purple" />
            Posición en la lista
          </h2>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={totalServices}
              value={displayOrder}
              onChange={handleOrderChange}
              className="w-24 bg-slate-800/60 border border-cyber-purple/30 rounded-xl px-3 py-2.5 text-sm text-white text-center focus:outline-none focus:border-cyber-purple transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              style={displayOrder !== originalOrder ? { boxShadow: '0 0 14px rgb(168 85 247 / 0.35)' } : undefined}
            />
            <span className="text-sm text-gray-400">
              de {totalServices} {totalServices === 1 ? 'servicio' : 'servicios'}
            </span>
            {displayOrder !== originalOrder && (
              <span className="text-xs text-cyber-purple font-medium">
                (era #{originalOrder})
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Los demás servicios se reordenan automáticamente al guardar
          </p>
        </Card>

        {/* Formulario principal */}
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
