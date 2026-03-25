'use client';

import { useState } from 'react';
import { Home, MessageCircle, HelpCircle, LayoutTemplate, Type } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateSiteConfig } from '@/app/actions/siteConfig';
import { updateHomeFeatures, type HomeFeature } from '@/app/actions/homeFeatures';
import { IconSelector } from '@/components/forms/IconSelector';
import { AccordionItem } from './AccordionItem';
import toast from 'react-hot-toast';

export interface SiteConfig {
  logo_text: string;
  home_title: string;
  home_title_es?: string | null;
  home_subtitle: string;
  home_subtitle_es?: string | null;
  home_categories: string[];
  home_categories_es?: string[] | null;
  accordion_title: string;
  accordion_title_es?: string | null;
  footer_payment_title: string;
  footer_payment_title_es?: string | null;
  footer_copyright: string;
  footer_copyright_es?: string | null;
  disclaimer: string;
  disclaimer_es?: string | null;
  discord_link: string;
  discord_work_us: string;
  payment_disclaimer: string;
  payment_disclaimer_es?: string | null;
  euro_value: number;
  logo_url: string;
  ui_services_label?: string | null;
  ui_services_label_es?: string | null;
  ui_categories_label?: string | null;
  ui_categories_label_es?: string | null;
  ui_back_to_categories?: string | null;
  ui_back_to_categories_es?: string | null;
  ui_select_category_hint?: string | null;
  ui_select_category_hint_es?: string | null;
  ui_no_services?: string | null;
  ui_no_services_es?: string | null;
  ui_select_region?: string | null;
  ui_select_region_es?: string | null;
  ui_accept_terms?: string | null;
  ui_accept_terms_es?: string | null;
  ui_payment_method_label?: string | null;
  ui_payment_method_label_es?: string | null;
  ui_total_to_pay?: string | null;
  ui_total_to_pay_es?: string | null;
  ui_important_notice?: string | null;
  ui_important_notice_es?: string | null;
  ui_estimated_delivery?: string | null;
  ui_estimated_delivery_es?: string | null;
  ui_pay_now?: string | null;
  ui_pay_now_es?: string | null;
  ui_cancel?: string | null;
  ui_cancel_es?: string | null;
  ui_discount_code_label?: string | null;
  ui_discount_code_label_es?: string | null;
  ui_discount_placeholder?: string | null;
  ui_discount_placeholder_es?: string | null;
  ui_discount_apply?: string | null;
  ui_discount_apply_es?: string | null;
  ui_buy_button?: string | null;
  ui_buy_button_es?: string | null;
  ui_currency_label?: string | null;
  ui_currency_label_es?: string | null;
  ui_checkout?: string | null;
  ui_checkout_es?: string | null;
  ui_paypal_label?: string | null;
  ui_paypal_label_es?: string | null;
  ui_card_label?: string | null;
  ui_card_label_es?: string | null;
  ui_saved?: string | null;
  ui_saved_es?: string | null;
  ui_discount_off?: string | null;
  ui_discount_off_es?: string | null;
  ui_search_placeholder?: string | null;
  ui_search_placeholder_es?: string | null;
  ui_search_no_results?: string | null;
  ui_search_no_results_es?: string | null;
  ui_service_singular?: string | null;
  ui_service_singular_es?: string | null;
  ui_service_plural?: string | null;
  ui_service_plural_es?: string | null;
  ui_select_amount?: string | null;
  ui_select_amount_es?: string | null;
  ui_amount_singular?: string | null;
  ui_amount_singular_es?: string | null;
  ui_amount_plural?: string | null;
  ui_amount_plural_es?: string | null;
  ui_selected_prefix?: string | null;
  ui_selected_prefix_es?: string | null;
  ui_selected?: string | null;
  ui_selected_es?: string | null;
  ui_additional_singular?: string | null;
  ui_additional_singular_es?: string | null;
  ui_additional_plural?: string | null;
  ui_additional_plural_es?: string | null;
  ui_choose_placeholder?: string | null;
  ui_choose_placeholder_es?: string | null;
  ui_bar_from?: string | null;
  ui_bar_from_es?: string | null;
  ui_bar_to?: string | null;
  ui_bar_to_es?: string | null;
  footer_community_label?: string | null;
  footer_community_label_es?: string | null;
  footer_discord_label?: string | null;
  footer_discord_label_es?: string | null;
  footer_work_us_label?: string | null;
  footer_work_us_label_es?: string | null;
}

interface ConfigFormProps {
  initial: SiteConfig;
  initialFeatures?: HomeFeature[];
}

export function ConfigForm({ initial, initialFeatures = [] }: ConfigFormProps) {
  const [config, setConfig] = useState<SiteConfig>(initial);
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [homeFeatures, setHomeFeatures] = useState<HomeFeature[]>(initialFeatures);

  const toggleSection = (id: string) =>
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  const handleCategoryChange = (index: number, value: string) => {
    const cats = [...config.home_categories];
    cats[index] = value;
    setConfig({ ...config, home_categories: cats });
  };

  const handleCategoryEsChange = (index: number, value: string) => {
    const cats = [...(config.home_categories_es ?? config.home_categories.map(() => ''))];
    cats[index] = value;
    setConfig({ ...config, home_categories_es: cats });
  };

  const addCategory = () =>
    setConfig({ ...config, home_categories: [...config.home_categories, ''] });

  const removeCategory = (index: number) =>
    setConfig({ ...config, home_categories: config.home_categories.filter((_, i) => i !== index) });

  const updateFeature = (index: number, field: keyof HomeFeature, value: string) => {
    setHomeFeatures(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const cleanedData = {
      ...config,
      home_categories: config.home_categories.filter(c => c.trim() !== ''),
      home_categories_es: (config.home_categories_es ?? []).filter(c => c.trim() !== ''),
    };
    const [configResult, featuresResult] = await Promise.all([
      updateSiteConfig(cleanedData),
      homeFeatures.length > 0
        ? updateHomeFeatures(homeFeatures.map(f => ({
            id: f.id,
            icon: f.icon,
            title: f.title,
            description: f.description,
            title_es: f.title_es || null,
            description_es: f.description_es || null,
          })))
        : Promise.resolve({ success: true }),
    ]);
    if (configResult.success && featuresResult.success) {
      toast.success('Configuración guardada');
    } else {
      toast.error((!configResult.success && configResult.error) || (!featuresResult.success && (featuresResult as any).error) || 'Error al guardar');
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
          label={<>Título Principal <span className="text-xs font-normal text-amber-400">(Spanish)</span></>}
          value={config.home_title_es ?? ''}
          onChange={(e) => setConfig({ ...config, home_title_es: e.target.value })}
          placeholder="BattleBoosting Gaming Services"
          className="border-amber-500/40 focus:border-amber-400"
        />
        <Input
          label="Subtítulo"
          value={config.home_subtitle}
          onChange={(e) => setConfig({ ...config, home_subtitle: e.target.value })}
          required
          placeholder="Your trusted platform for professional gaming services"
        />
        <Input
          label={<>Subtítulo <span className="text-xs font-normal text-amber-400">(Spanish)</span></>}
          value={config.home_subtitle_es ?? ''}
          onChange={(e) => setConfig({ ...config, home_subtitle_es: e.target.value })}
          placeholder="Tu plataforma de confianza para servicios de gaming"
          className="border-amber-500/40 focus:border-amber-400"
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
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-medium text-amber-300">
            Categorías del Home <span className="text-xs font-normal text-amber-400">(Spanish)</span>
          </label>
          <p className="text-xs text-gray-400 -mt-1">Traducción de cada categoría en el mismo orden.</p>
          {config.home_categories.map((_, index) => (
            <Input
              key={index}
              value={config.home_categories_es?.[index] ?? ''}
              onChange={(e) => handleCategoryEsChange(index, e.target.value)}
              placeholder={`Categoría ${index + 1} en Español`}
              className="border-amber-500/40 focus:border-amber-400"
            />
          ))}
        </div>

        {/* Home Features */}
        {homeFeatures.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs sm:text-sm font-medium text-gray-200">
                Tarjetas de Características
              </label>
              <span className="text-xs text-gray-500">{homeFeatures.length} tarjetas</span>
            </div>
            <p className="text-xs text-gray-400 -mt-1">
              Las tarjetas de beneficios que se muestran en la sección principal del home.
            </p>
            <div className="space-y-3">
              {homeFeatures.map((feature, index) => (
                <div
                  key={feature.id}
                  className="p-3 bg-slate-800/40 border border-slate-700/40 rounded-lg space-y-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Tarjeta {feature.display_order}
                    </span>
                  </div>
                  <IconSelector
                    value={feature.icon}
                    onChange={(icon) => updateFeature(index, 'icon', icon)}
                    label="Icono"
                  />
                  <Input
                    label="Título"
                    value={feature.title}
                    onChange={(e) => updateFeature(index, 'title', e.target.value)}
                    placeholder="Fast Delivery"
                  />
                  <Input
                    label={<>Título <span className="text-xs font-normal text-amber-400">(Spanish)</span></>}
                    value={feature.title_es ?? ''}
                    onChange={(e) => updateFeature(index, 'title_es', e.target.value)}
                    placeholder="Entrega Rápida"
                    className="border-amber-500/40 focus:border-amber-400"
                  />
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-medium text-gray-200">Descripción</label>
                    <textarea
                      value={feature.description}
                      onChange={(e) => updateFeature(index, 'description', e.target.value)}
                      rows={2}
                      placeholder="Professional players ensure quick and efficient service completion"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyber-purple/50 focus:border-cyber-purple transition-all duration-300 resize-vertical"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-medium text-amber-300">
                      Descripción <span className="text-xs font-normal text-amber-400">(Spanish)</span>
                    </label>
                    <textarea
                      value={feature.description_es ?? ''}
                      onChange={(e) => updateFeature(index, 'description_es', e.target.value)}
                      rows={2}
                      placeholder="Jugadores profesionales garantizan una ejecución rápida y eficiente"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800/50 border border-amber-500/40 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all duration-300 resize-vertical"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </AccordionItem>

      {/* Textos de la Interfaz */}
      <AccordionItem
        id="ui-texts"
        title="Textos de la Interfaz"
        desc="Etiquetas y botones visibles en el frontend"
        icon={<Type size={18} className="text-sky-400" />}
        iconBg="bg-sky-400/15 border-sky-400/25"
        openSections={openSections}
        toggle={toggleSection}
      >
        {/* Página de Juego */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pb-1 border-b border-slate-700/40">Página de Juego</p>
        <Input label="Etiqueta Servicios" value={config.ui_services_label ?? ''} onChange={(e) => setConfig({ ...config, ui_services_label: e.target.value })} placeholder="Services" />
        <Input label={<>Etiqueta Servicios <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_services_label_es ?? ''} onChange={(e) => setConfig({ ...config, ui_services_label_es: e.target.value })} placeholder="Servicios" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Etiqueta Categorías" value={config.ui_categories_label ?? ''} onChange={(e) => setConfig({ ...config, ui_categories_label: e.target.value })} placeholder="Categories" />
        <Input label={<>Etiqueta Categorías <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_categories_label_es ?? ''} onChange={(e) => setConfig({ ...config, ui_categories_label_es: e.target.value })} placeholder="Categorías" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Volver a categorías" value={config.ui_back_to_categories ?? ''} onChange={(e) => setConfig({ ...config, ui_back_to_categories: e.target.value })} placeholder="Back to categories" />
        <Input label={<>Volver a categorías <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_back_to_categories_es ?? ''} onChange={(e) => setConfig({ ...config, ui_back_to_categories_es: e.target.value })} placeholder="Volver a categorías" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Hint selección de categoría" value={config.ui_select_category_hint ?? ''} onChange={(e) => setConfig({ ...config, ui_select_category_hint: e.target.value })} placeholder="Select a category to explore..." />
        <Input label={<>Hint selección de categoría <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_select_category_hint_es ?? ''} onChange={(e) => setConfig({ ...config, ui_select_category_hint_es: e.target.value })} placeholder="Selecciona una categoría para explorar..." className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Sin servicios disponibles" value={config.ui_no_services ?? ''} onChange={(e) => setConfig({ ...config, ui_no_services: e.target.value })} placeholder="No services available for this game." />
        <Input label={<>Sin servicios disponibles <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_no_services_es ?? ''} onChange={(e) => setConfig({ ...config, ui_no_services_es: e.target.value })} placeholder="No hay servicios disponibles para este juego." className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Servicio (singular)" value={config.ui_service_singular ?? ''} onChange={(e) => setConfig({ ...config, ui_service_singular: e.target.value })} placeholder="service" />
        <Input label={<>Servicio (singular) <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_service_singular_es ?? ''} onChange={(e) => setConfig({ ...config, ui_service_singular_es: e.target.value })} placeholder="servicio" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Servicios (plural)" value={config.ui_service_plural ?? ''} onChange={(e) => setConfig({ ...config, ui_service_plural: e.target.value })} placeholder="services" />
        <Input label={<>Servicios (plural) <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_service_plural_es ?? ''} onChange={(e) => setConfig({ ...config, ui_service_plural_es: e.target.value })} placeholder="servicios" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Placeholder búsqueda" value={config.ui_search_placeholder ?? ''} onChange={(e) => setConfig({ ...config, ui_search_placeholder: e.target.value })} placeholder="Search services…" />
        <Input label={<>Placeholder búsqueda <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_search_placeholder_es ?? ''} onChange={(e) => setConfig({ ...config, ui_search_placeholder_es: e.target.value })} placeholder="Buscar servicios…" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Sin resultados (búsqueda)" value={config.ui_search_no_results ?? ''} onChange={(e) => setConfig({ ...config, ui_search_no_results: e.target.value })} placeholder="No services match" />
        <Input label={<>Sin resultados (búsqueda) <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_search_no_results_es ?? ''} onChange={(e) => setConfig({ ...config, ui_search_no_results_es: e.target.value })} placeholder="Sin resultados para" className="border-amber-500/40 focus:border-amber-400" />

        {/* Sidebar y Checkout de Pago */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pb-1 border-b border-slate-700/40 pt-2">Sidebar y Checkout de Pago</p>
        <Input label="Etiqueta moneda" value={config.ui_currency_label ?? ''} onChange={(e) => setConfig({ ...config, ui_currency_label: e.target.value })} placeholder="Currency" />
        <Input label={<>Etiqueta moneda <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_currency_label_es ?? ''} onChange={(e) => setConfig({ ...config, ui_currency_label_es: e.target.value })} placeholder="Moneda" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Título Checkout" value={config.ui_checkout ?? ''} onChange={(e) => setConfig({ ...config, ui_checkout: e.target.value })} placeholder="Checkout" />
        <Input label={<>Título Checkout <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_checkout_es ?? ''} onChange={(e) => setConfig({ ...config, ui_checkout_es: e.target.value })} placeholder="Pago" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Etiqueta PayPal" value={config.ui_paypal_label ?? ''} onChange={(e) => setConfig({ ...config, ui_paypal_label: e.target.value })} placeholder="PayPal" />
        <Input label={<>Etiqueta PayPal <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_paypal_label_es ?? ''} onChange={(e) => setConfig({ ...config, ui_paypal_label_es: e.target.value })} placeholder="PayPal" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Etiqueta Tarjeta" value={config.ui_card_label ?? ''} onChange={(e) => setConfig({ ...config, ui_card_label: e.target.value })} placeholder="Card" />
        <Input label={<>Etiqueta Tarjeta <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_card_label_es ?? ''} onChange={(e) => setConfig({ ...config, ui_card_label_es: e.target.value })} placeholder="Tarjeta" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Texto ahorrado" value={config.ui_saved ?? ''} onChange={(e) => setConfig({ ...config, ui_saved: e.target.value })} placeholder="saved" />
        <Input label={<>Texto ahorrado <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_saved_es ?? ''} onChange={(e) => setConfig({ ...config, ui_saved_es: e.target.value })} placeholder="ahorrado" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Seleccionar región" value={config.ui_select_region ?? ''} onChange={(e) => setConfig({ ...config, ui_select_region: e.target.value })} placeholder="Select Region" />
        <Input label={<>Seleccionar región <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_select_region_es ?? ''} onChange={(e) => setConfig({ ...config, ui_select_region_es: e.target.value })} placeholder="Seleccionar región" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Aceptar términos" value={config.ui_accept_terms ?? ''} onChange={(e) => setConfig({ ...config, ui_accept_terms: e.target.value })} placeholder="I accept the service policies" />
        <Input label={<>Aceptar términos <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_accept_terms_es ?? ''} onChange={(e) => setConfig({ ...config, ui_accept_terms_es: e.target.value })} placeholder="Acepto las políticas de servicio" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Método de pago" value={config.ui_payment_method_label ?? ''} onChange={(e) => setConfig({ ...config, ui_payment_method_label: e.target.value })} placeholder="Payment Method" />
        <Input label={<>Método de pago <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_payment_method_label_es ?? ''} onChange={(e) => setConfig({ ...config, ui_payment_method_label_es: e.target.value })} placeholder="Método de pago" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Total a pagar" value={config.ui_total_to_pay ?? ''} onChange={(e) => setConfig({ ...config, ui_total_to_pay: e.target.value })} placeholder="Total to pay:" />
        <Input label={<>Total a pagar <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_total_to_pay_es ?? ''} onChange={(e) => setConfig({ ...config, ui_total_to_pay_es: e.target.value })} placeholder="Total a pagar:" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Aviso importante" value={config.ui_important_notice ?? ''} onChange={(e) => setConfig({ ...config, ui_important_notice: e.target.value })} placeholder="Important Notice" />
        <Input label={<>Aviso importante <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_important_notice_es ?? ''} onChange={(e) => setConfig({ ...config, ui_important_notice_es: e.target.value })} placeholder="Aviso importante" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Entrega estimada" value={config.ui_estimated_delivery ?? ''} onChange={(e) => setConfig({ ...config, ui_estimated_delivery: e.target.value })} placeholder="Estimated delivery:" />
        <Input label={<>Entrega estimada <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_estimated_delivery_es ?? ''} onChange={(e) => setConfig({ ...config, ui_estimated_delivery_es: e.target.value })} placeholder="Entrega estimada:" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Botón Pagar" value={config.ui_pay_now ?? ''} onChange={(e) => setConfig({ ...config, ui_pay_now: e.target.value })} placeholder="Pay Now" />
        <Input label={<>Botón Pagar <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_pay_now_es ?? ''} onChange={(e) => setConfig({ ...config, ui_pay_now_es: e.target.value })} placeholder="Pagar ahora" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Botón Cancelar" value={config.ui_cancel ?? ''} onChange={(e) => setConfig({ ...config, ui_cancel: e.target.value })} placeholder="Cancel" />
        <Input label={<>Botón Cancelar <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_cancel_es ?? ''} onChange={(e) => setConfig({ ...config, ui_cancel_es: e.target.value })} placeholder="Cancelar" className="border-amber-500/40 focus:border-amber-400" />

        {/* Descuento */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pb-1 border-b border-slate-700/40 pt-2">Código de Descuento</p>
        <Input label="Sufijo % descuento" value={config.ui_discount_off ?? ''} onChange={(e) => setConfig({ ...config, ui_discount_off: e.target.value })} placeholder="off" />
        <Input label={<>Sufijo % descuento <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_discount_off_es ?? ''} onChange={(e) => setConfig({ ...config, ui_discount_off_es: e.target.value })} placeholder="desc." className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Etiqueta código" value={config.ui_discount_code_label ?? ''} onChange={(e) => setConfig({ ...config, ui_discount_code_label: e.target.value })} placeholder="Discount Code" />
        <Input label={<>Etiqueta código <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_discount_code_label_es ?? ''} onChange={(e) => setConfig({ ...config, ui_discount_code_label_es: e.target.value })} placeholder="Código de descuento" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Placeholder" value={config.ui_discount_placeholder ?? ''} onChange={(e) => setConfig({ ...config, ui_discount_placeholder: e.target.value })} placeholder="Enter code" />
        <Input label={<>Placeholder <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_discount_placeholder_es ?? ''} onChange={(e) => setConfig({ ...config, ui_discount_placeholder_es: e.target.value })} placeholder="Ingresar código" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Botón Aplicar" value={config.ui_discount_apply ?? ''} onChange={(e) => setConfig({ ...config, ui_discount_apply: e.target.value })} placeholder="Apply" />
        <Input label={<>Botón Aplicar <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_discount_apply_es ?? ''} onChange={(e) => setConfig({ ...config, ui_discount_apply_es: e.target.value })} placeholder="Aplicar" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Botón Comprar" value={config.ui_buy_button ?? ''} onChange={(e) => setConfig({ ...config, ui_buy_button: e.target.value })} placeholder="Buy" />
        <Input label={<>Botón Comprar <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_buy_button_es ?? ''} onChange={(e) => setConfig({ ...config, ui_buy_button_es: e.target.value })} placeholder="Comprar" className="border-amber-500/40 focus:border-amber-400" />

        {/* Componentes de Precio */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pb-1 border-b border-slate-700/40 pt-2">Componentes de Precio</p>
        <Input label="Seleccionar cantidad" value={config.ui_select_amount ?? ''} onChange={(e) => setConfig({ ...config, ui_select_amount: e.target.value })} placeholder="Select Amount" />
        <Input label={<>Seleccionar cantidad <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_select_amount_es ?? ''} onChange={(e) => setConfig({ ...config, ui_select_amount_es: e.target.value })} placeholder="Seleccionar cantidad" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Cantidad (singular)" value={config.ui_amount_singular ?? ''} onChange={(e) => setConfig({ ...config, ui_amount_singular: e.target.value })} placeholder="amount" />
        <Input label={<>Cantidad (singular) <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_amount_singular_es ?? ''} onChange={(e) => setConfig({ ...config, ui_amount_singular_es: e.target.value })} placeholder="cantidad" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Cantidades (plural)" value={config.ui_amount_plural ?? ''} onChange={(e) => setConfig({ ...config, ui_amount_plural: e.target.value })} placeholder="amounts" />
        <Input label={<>Cantidades (plural) <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_amount_plural_es ?? ''} onChange={(e) => setConfig({ ...config, ui_amount_plural_es: e.target.value })} placeholder="cantidades" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Prefijo seleccionado" value={config.ui_selected_prefix ?? ''} onChange={(e) => setConfig({ ...config, ui_selected_prefix: e.target.value })} placeholder="Selected:" />
        <Input label={<>Prefijo seleccionado <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_selected_prefix_es ?? ''} onChange={(e) => setConfig({ ...config, ui_selected_prefix_es: e.target.value })} placeholder="Seleccionado:" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Texto seleccionado" value={config.ui_selected ?? ''} onChange={(e) => setConfig({ ...config, ui_selected: e.target.value })} placeholder="selected" />
        <Input label={<>Texto seleccionado <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_selected_es ?? ''} onChange={(e) => setConfig({ ...config, ui_selected_es: e.target.value })} placeholder="seleccionado" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Servicio adicional (singular)" value={config.ui_additional_singular ?? ''} onChange={(e) => setConfig({ ...config, ui_additional_singular: e.target.value })} placeholder="additional service" />
        <Input label={<>Servicio adicional (singular) <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_additional_singular_es ?? ''} onChange={(e) => setConfig({ ...config, ui_additional_singular_es: e.target.value })} placeholder="servicio adicional" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Servicios adicionales (plural)" value={config.ui_additional_plural ?? ''} onChange={(e) => setConfig({ ...config, ui_additional_plural: e.target.value })} placeholder="additional services" />
        <Input label={<>Servicios adicionales (plural) <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_additional_plural_es ?? ''} onChange={(e) => setConfig({ ...config, ui_additional_plural_es: e.target.value })} placeholder="servicios adicionales" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Placeholder selector" value={config.ui_choose_placeholder ?? ''} onChange={(e) => setConfig({ ...config, ui_choose_placeholder: e.target.value })} placeholder="Choose..." />
        <Input label={<>Placeholder selector <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_choose_placeholder_es ?? ''} onChange={(e) => setConfig({ ...config, ui_choose_placeholder_es: e.target.value })} placeholder="Elegir..." className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Barra: Desde" value={config.ui_bar_from ?? ''} onChange={(e) => setConfig({ ...config, ui_bar_from: e.target.value })} placeholder="From" />
        <Input label={<>Barra: Desde <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_bar_from_es ?? ''} onChange={(e) => setConfig({ ...config, ui_bar_from_es: e.target.value })} placeholder="Desde" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Barra: Hasta" value={config.ui_bar_to ?? ''} onChange={(e) => setConfig({ ...config, ui_bar_to: e.target.value })} placeholder="To" />
        <Input label={<>Barra: Hasta <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.ui_bar_to_es ?? ''} onChange={(e) => setConfig({ ...config, ui_bar_to_es: e.target.value })} placeholder="Hasta" className="border-amber-500/40 focus:border-amber-400" />

        {/* Footer Textos */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pb-1 border-b border-slate-700/40 pt-2">Footer (Textos)</p>
        <Input label="Etiqueta Comunidad" value={config.footer_community_label ?? ''} onChange={(e) => setConfig({ ...config, footer_community_label: e.target.value })} placeholder="Community" />
        <Input label={<>Etiqueta Comunidad <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.footer_community_label_es ?? ''} onChange={(e) => setConfig({ ...config, footer_community_label_es: e.target.value })} placeholder="Comunidad" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Etiqueta Discord" value={config.footer_discord_label ?? ''} onChange={(e) => setConfig({ ...config, footer_discord_label: e.target.value })} placeholder="Join Discord" />
        <Input label={<>Etiqueta Discord <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.footer_discord_label_es ?? ''} onChange={(e) => setConfig({ ...config, footer_discord_label_es: e.target.value })} placeholder="Únete al Discord" className="border-amber-500/40 focus:border-amber-400" />
        <Input label="Etiqueta Trabaja con Nosotros" value={config.footer_work_us_label ?? ''} onChange={(e) => setConfig({ ...config, footer_work_us_label: e.target.value })} placeholder="Work with Us" />
        <Input label={<>Etiqueta Trabaja con Nosotros <span className="text-xs font-normal text-amber-400">(Spanish)</span></>} value={config.footer_work_us_label_es ?? ''} onChange={(e) => setConfig({ ...config, footer_work_us_label_es: e.target.value })} placeholder="Trabaja con Nosotros" className="border-amber-500/40 focus:border-amber-400" />
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
        <Input
          label={<>Título del Acordeón <span className="text-xs font-normal text-amber-400">(Spanish)</span></>}
          value={config.accordion_title_es ?? ''}
          onChange={(e) => setConfig({ ...config, accordion_title_es: e.target.value })}
          placeholder="Preguntas Frecuentes"
          className="border-amber-500/40 focus:border-amber-400"
        />
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
          label={<>Título de Métodos de Pago <span className="text-xs font-normal text-amber-400">(Spanish)</span></>}
          value={config.footer_payment_title_es ?? ''}
          onChange={(e) => setConfig({ ...config, footer_payment_title_es: e.target.value })}
          placeholder="Métodos de pago aceptados"
          className="border-amber-500/40 focus:border-amber-400"
        />
        <Input
          label="Copyright"
          value={config.footer_copyright}
          onChange={(e) => setConfig({ ...config, footer_copyright: e.target.value })}
          required
          placeholder="© 2025 BattleBoosting. All rights reserved."
        />
        <Input
          label={<>Copyright <span className="text-xs font-normal text-amber-400">(Spanish)</span></>}
          value={config.footer_copyright_es ?? ''}
          onChange={(e) => setConfig({ ...config, footer_copyright_es: e.target.value })}
          placeholder="© 2025 BattleBoosting. Todos los derechos reservados."
          className="border-amber-500/40 focus:border-amber-400"
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
          <label className="block text-xs sm:text-sm font-medium text-amber-300">
            Disclaimer <span className="text-xs font-normal text-amber-400">(Spanish)</span>
          </label>
          <textarea
            value={config.disclaimer_es ?? ''}
            onChange={(e) => setConfig({ ...config, disclaimer_es: e.target.value })}
            rows={4}
            placeholder="Todos los servicios se ofrecen con fines de entretenimiento..."
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800/50 border border-amber-500/40 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all duration-300 resize-vertical"
          />
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
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-medium text-amber-300">
            Aviso de Pago <span className="text-xs font-normal text-amber-400">(Spanish)</span>
          </label>
          <textarea
            value={config.payment_disclaimer_es ?? ''}
            onChange={(e) => setConfig({ ...config, payment_disclaimer_es: e.target.value })}
            rows={3}
            placeholder="Después de completar tu pago, crea un ticket en nuestro Discord..."
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800/50 border border-amber-500/40 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all duration-300 resize-vertical"
          />
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
