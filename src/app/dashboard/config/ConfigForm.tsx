'use client';

import { useState } from 'react';
import { Home, MessageCircle, HelpCircle, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateSiteConfig } from '@/app/actions/siteConfig';
import { AccordionItem } from './AccordionItem';
import toast from 'react-hot-toast';

export interface SiteConfig {
  logo_text: string;
  home_title: string;
  home_subtitle: string;
  home_categories: string[];
  accordion_title: string;
  footer_payment_title: string;
  footer_copyright: string;
  disclaimer: string;
  discord_link: string;
  discord_work_us: string;
  payment_disclaimer: string;
  euro_value: number;
  logo_url: string;
}

interface ConfigFormProps {
  initial: SiteConfig;
}

export function ConfigForm({ initial }: ConfigFormProps) {
  const [config, setConfig] = useState<SiteConfig>(initial);
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) =>
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  const handleCategoryChange = (index: number, value: string) => {
    const cats = [...config.home_categories];
    cats[index] = value;
    setConfig({ ...config, home_categories: cats });
  };

  const addCategory = () =>
    setConfig({ ...config, home_categories: [...config.home_categories, ''] });

  const removeCategory = (index: number) =>
    setConfig({ ...config, home_categories: config.home_categories.filter((_, i) => i !== index) });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const cleanedData = {
      ...config,
      home_categories: config.home_categories.filter(c => c.trim() !== ''),
    };
    const result = await updateSiteConfig(cleanedData);
    if (result.success) {
      toast.success('Configuración guardada');
    } else {
      toast.error(result.error || 'Error al guardar');
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Inicio */}
      <AccordionItem
        id="inicio"
        title="Página de Inicio"
        desc="Logo, título, subtítulo y categorías"
        icon={<Home size={18} className="text-cyber-purple" />}
        iconBg="bg-cyber-purple/15 border-cyber-purple/25"
        openSections={openSections}
        toggle={toggleSection}
      >
        <Input
          label="Texto del Logo"
          value={config.logo_text}
          onChange={(e) => setConfig({ ...config, logo_text: e.target.value })}
          required
          placeholder="BATTLE BOOSTING"
        />
        <p className="text-xs text-gray-400 -mt-2">
          El texto se divide por espacios para crear líneas múltiples en el logo.
        </p>
        <Input
          label="URL del Logo"
          value={config.logo_url}
          onChange={(e) => setConfig({ ...config, logo_url: e.target.value })}
          placeholder="https://... (URL de imagen subida en sección Imágenes)"
        />
        <p className="text-xs text-gray-400 -mt-2">
          Si está vacío se usa el texto del logo. Sube la imagen desde Imágenes y pega aquí la URL.
        </p>
        {config.logo_url && (
          <div>
            <p className="text-xs text-gray-400 mb-2">Vista previa:</p>
            <img
              src={config.logo_url}
              alt="Logo preview"
              className="h-16 object-contain bg-slate-800/60 rounded-lg p-2 border border-slate-700/50"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
        <Input
          label="Valor del Euro (en USD)"
          type="number"
          step="0.0001"
          min="0"
          value={String(config.euro_value)}
          onChange={(e) => setConfig({ ...config, euro_value: parseFloat(e.target.value) || 1.08 })}
          placeholder="1.0800"
        />
        <p className="text-xs text-gray-400 -mt-2">
          Tasa de cambio manual EUR → USD. Se usa en el front para mostrar precios en euros.
        </p>
        <Input
          label="Título Principal (Tab)"
          value={config.home_title}
          onChange={(e) => setConfig({ ...config, home_title: e.target.value })}
          required
          placeholder="BattleBoosting Gaming Services"
        />
        <Input
          label="Subtítulo"
          value={config.home_subtitle}
          onChange={(e) => setConfig({ ...config, home_subtitle: e.target.value })}
          required
          placeholder="Your trusted platform for professional gaming services"
        />
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-200">
            Categorías del Home
          </label>
          {config.home_categories.map((category, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={category}
                onChange={(e) => handleCategoryChange(index, e.target.value)}
                placeholder={`Categoría ${index + 1}`}
                className="flex-1"
              />
              {config.home_categories.length > 1 && (
                <Button type="button" variant="danger" onClick={() => removeCategory(index)} className="px-3!">
                  ✕
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={addCategory} className="w-full">
            + Agregar Categoría
          </Button>
        </div>
      </AccordionItem>

      {/* FAQ */}
      <AccordionItem
        id="faq"
        title="FAQ / Acordeón"
        desc="Título de la sección de preguntas frecuentes"
        icon={<HelpCircle size={18} className="text-cyber-green" />}
        iconBg="bg-cyber-green/15 border-cyber-green/25"
        openSections={openSections}
        toggle={toggleSection}
      >
        <Input
          label="Título del Acordeón"
          value={config.accordion_title}
          onChange={(e) => setConfig({ ...config, accordion_title: e.target.value })}
          required
          placeholder="Frequently Asked Questions"
        />
        <p className="text-xs text-gray-400 -mt-2">
          Este título se muestra encima del acordeón de preguntas frecuentes en la página pública.
        </p>
      </AccordionItem>

      {/* Discord */}
      <AccordionItem
        id="discord"
        title="Discord"
        desc="Links de invitación al servidor de Discord"
        icon={<MessageCircle size={18} className="text-indigo-400" />}
        iconBg="bg-indigo-400/15 border-indigo-400/25"
        openSections={openSections}
        toggle={toggleSection}
      >
        <Input
          label="Link de Discord (Servidor Principal)"
          value={config.discord_link}
          onChange={(e) => setConfig({ ...config, discord_link: e.target.value })}
          placeholder="https://discord.gg/tu-servidor-aqui"
        />
        <p className="text-xs text-gray-400 -mt-2">
          Link de invitación al servidor de Discord principal.
        </p>
        <Input
          label="Link de Discord (Trabaja con Nosotros)"
          value={config.discord_work_us}
          onChange={(e) => setConfig({ ...config, discord_work_us: e.target.value })}
          placeholder="https://discord.gg/tu-servidor-work-aqui"
        />
        <p className="text-xs text-gray-400 -mt-2">
          Link de Discord para reclutamiento y trabajo.
        </p>
      </AccordionItem>

      {/* Footer */}
      <AccordionItem
        id="footer"
        title="Footer"
        desc="Métodos de pago, copyright, disclaimer y aviso de pago"
        icon={<LayoutTemplate size={18} className="text-cyber-pink" />}
        iconBg="bg-cyber-pink/15 border-cyber-pink/25"
        openSections={openSections}
        toggle={toggleSection}
      >
        <Input
          label="Título de Métodos de Pago"
          value={config.footer_payment_title}
          onChange={(e) => setConfig({ ...config, footer_payment_title: e.target.value })}
          required
          placeholder="Accepted payment methods"
        />
        <Input
          label="Copyright"
          value={config.footer_copyright}
          onChange={(e) => setConfig({ ...config, footer_copyright: e.target.value })}
          required
          placeholder="© 2025 BattleBoosting. All rights reserved."
        />
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-200">Disclaimer</label>
          <textarea
            value={config.disclaimer}
            onChange={(e) => setConfig({ ...config, disclaimer: e.target.value })}
            required
            rows={4}
            placeholder="All services are provided for entertainment purposes only..."
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyber-purple/50 focus:border-cyber-purple transition-all duration-300 resize-vertical"
          />
          <p className="text-xs text-gray-400">
            Mensaje de liberación de responsabilidad que se muestra en el footer.
          </p>
        </div>
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-200">Aviso de Pago</label>
          <textarea
            value={config.payment_disclaimer}
            onChange={(e) => setConfig({ ...config, payment_disclaimer: e.target.value })}
            rows={3}
            placeholder="After completing your payment, please create a ticket in our Discord server to start your order..."
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyber-purple/50 focus:border-cyber-purple transition-all duration-300 resize-vertical"
          />
          <p className="text-xs text-gray-400">
            Mensaje que se muestra después de completar el pago (opcional).
          </p>
        </div>
      </AccordionItem>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </form>
  );
}
