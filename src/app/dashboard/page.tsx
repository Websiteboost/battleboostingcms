import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Gamepad2, Folder, Package, Image, Settings } from 'lucide-react';

async function getStats() {
  try {
    const [games, categories, services] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM games`,
      sql`SELECT COUNT(*) as count FROM categories`,
      sql`SELECT COUNT(*) as count FROM services`,
    ]);

    return {
      games: Number(games[0].count),
      categories: Number(categories[0].count),
      services: Number(services[0].count),
    };
  } catch (error) {
    return { games: 0, categories: 0, services: 0 };
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const stats = await getStats();
  const isAdmin = (session?.user as any)?.role === 'admin';

  const statCards = [
    { title: 'Juegos', value: stats.games, icon: Gamepad2, color: 'purple' },
    { title: 'Categorías', value: stats.categories, icon: Folder, color: 'cyan' },
    { title: 'Servicios', value: stats.services, icon: Package, color: 'pink' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold neon-text mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-400 truncate">
          Bienvenido, <span className="text-cyber-purple">{session?.user?.email}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} hover={false} className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl sm:text-4xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-3 sm:p-4 rounded-full ${stat.color === 'purple' ? 'bg-cyber-purple/20' : stat.color === 'cyan' ? 'bg-cyber-cyan/20' : 'bg-cyber-pink/20'}`}>
                  <Icon size={28} className={`sm:w-8 sm:h-8 ${stat.color === 'purple' ? 'text-cyber-purple' : stat.color === 'cyan' ? 'text-cyber-cyan' : 'text-cyber-pink'}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Acciones Rápidas</h2>
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-3 sm:gap-4`}>
          <a
            href="/dashboard/games"
            className="p-3 sm:p-4 rounded-lg bg-cyber-purple/10 hover:bg-cyber-purple/20 border border-cyber-purple/30 transition-all"
          >
            <Gamepad2 className="mb-2" size={20} />
            <p className="font-medium text-sm sm:text-base">Gestionar Juegos</p>
          </a>
          <a
            href="/dashboard/categories"
            className="p-3 sm:p-4 rounded-lg bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 transition-all"
          >
            <Folder className="mb-2" size={20} />
            <p className="font-medium text-sm sm:text-base">Gestionar Categorías</p>
          </a>
          <a
            href="/dashboard/services"
            className="p-3 sm:p-4 rounded-lg bg-cyber-pink/10 hover:bg-cyber-pink/20 border border-cyber-pink/30 transition-all"
          >
            <Package className="mb-2" size={20} />
            <p className="font-medium text-sm sm:text-base">Gestionar Servicios</p>
          </a>
          <a
            href="/dashboard/images"
            className="p-3 sm:p-4 rounded-lg bg-cyber-green/10 hover:bg-cyber-green/20 border border-cyber-green/30 transition-all"
          >
            <Image className="mb-2" size={20} />
            <p className="font-medium text-sm sm:text-base">Gestionar Imágenes</p>
          </a>
          {isAdmin && (
            <a
              href="/dashboard/config"
              className="p-3 sm:p-4 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all"
            >
              <Settings className="mb-2" size={20} />
              <p className="font-medium text-sm sm:text-base">Configuración</p>
            </a>
          )}
        </div>
      </Card>
    </div>
  );
}
