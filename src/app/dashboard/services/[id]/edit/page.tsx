// RSC — Server Component: fetch all data in parallel (async-parallel skill)
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServices } from '@/app/actions/services';
import { getCategories } from '@/app/actions/categories';
import { getGames } from '@/app/actions/games';
import { getServicePriceComponents } from '@/app/actions/servicePrices';
import { getServiceGames } from '@/app/actions/serviceGames';
import { EditServiceClient } from './edit-client';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { id } = await params;

  // async-parallel: all 5 fetches run concurrently — no waterfall
  const [servicesResult, categoriesResult, gamesResult, priceComponents, gameIds] =
    await Promise.all([
      getServices(),
      getCategories(),
      getGames(),
      getServicePriceComponents(id),
      getServiceGames(id),
    ]);

  const service = servicesResult.data?.find(s => s.id === id);
  if (!service) notFound();

  return (
    <EditServiceClient
      service={{ ...service, priceComponents, gameIds }}
      categories={categoriesResult.data ?? []}
      games={gamesResult.data ?? []}
      totalServices={servicesResult.data?.length ?? 0}
    />
  );
}
