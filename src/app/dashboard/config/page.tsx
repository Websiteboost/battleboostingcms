'use client';

import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { getSiteConfig } from '@/app/actions/siteConfig';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { ConfigForm, type SiteConfig } from './ConfigForm';
import { DangerZone } from './DangerZone';

const DEFAULT_CONFIG: SiteConfig = {
  logo_text: '',
  home_title: '',
  home_subtitle: '',
  home_categories: [''],
  accordion_title: '',
  footer_payment_title: '',
  footer_copyright: '',
  disclaimer: '',
  discord_link: '',
  discord_work_us: '',
  payment_disclaimer: '',
  euro_value: 1.08,
  logo_url: '',
};

function ConfigContent() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteConfig().then((result) => {
      if (result.success && result.data) {
        const d = result.data as any;
        setConfig({
          logo_text: d.logo_text ?? '',
          home_title: d.home_title ?? '',
          home_subtitle: d.home_subtitle ?? '',
          home_categories: d.home_categories ?? [''],
          accordion_title: d.accordion_title ?? '',
          footer_payment_title: d.footer_payment_title ?? '',
          footer_copyright: d.footer_copyright ?? '',
          disclaimer: d.disclaimer ?? '',
          discord_link: d.discord_link ?? '',
          discord_work_us: d.discord_work_us ?? '',
          payment_disclaimer: d.payment_disclaimer ?? '',
          euro_value: d.euro_value ?? 1.08,
          logo_url: d.logo_url ?? '',
        });
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse-glow text-cyber-purple text-xl">Cargando configuracion...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-cyber-purple/20 rounded-xl border border-cyber-purple/30">
          <Settings size={22} className="text-cyber-purple" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Configuracion del Sitio</h1>
          <p className="text-xs text-gray-400">Gestiona la configuracion general del sitio web</p>
        </div>
      </div>

      <ConfigForm initial={config} />
      <DangerZone />
    </div>
  );
}

export default function ConfigPage() {
  return (
    <AdminGuard>
      <ConfigContent />
    </AdminGuard>
  );
}
