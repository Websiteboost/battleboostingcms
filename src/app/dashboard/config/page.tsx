'use client';

import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { getSiteConfig } from '@/app/actions/siteConfig';
import { getHomeFeatures, type HomeFeature } from '@/app/actions/homeFeatures';
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
  const [features, setFeatures] = useState<HomeFeature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSiteConfig(), getHomeFeatures()]).then(([configResult, featuresResult]) => {
      if (configResult.success && configResult.data) {
        const d = configResult.data as any;
        setConfig({
          logo_text: d.logo_text ?? '',
          home_title: d.home_title ?? '',
          home_title_es: d.home_title_es ?? '',
          home_subtitle: d.home_subtitle ?? '',
          home_subtitle_es: d.home_subtitle_es ?? '',
          home_categories: d.home_categories ?? [''],
          home_categories_es: d.home_categories_es ?? [],
          accordion_title: d.accordion_title ?? '',
          accordion_title_es: d.accordion_title_es ?? '',
          footer_payment_title: d.footer_payment_title ?? '',
          footer_payment_title_es: d.footer_payment_title_es ?? '',
          footer_copyright: d.footer_copyright ?? '',
          footer_copyright_es: d.footer_copyright_es ?? '',
          disclaimer: d.disclaimer ?? '',
          disclaimer_es: d.disclaimer_es ?? '',
          discord_link: d.discord_link ?? '',
          discord_work_us: d.discord_work_us ?? '',
          payment_disclaimer: d.payment_disclaimer ?? '',
          payment_disclaimer_es: d.payment_disclaimer_es ?? '',
          euro_value: d.euro_value ?? 1.08,
          logo_url: d.logo_url ?? '',
          ui_services_label: d.ui_services_label ?? '',
          ui_services_label_es: d.ui_services_label_es ?? '',
          ui_categories_label: d.ui_categories_label ?? '',
          ui_categories_label_es: d.ui_categories_label_es ?? '',
          ui_back_to_categories: d.ui_back_to_categories ?? '',
          ui_back_to_categories_es: d.ui_back_to_categories_es ?? '',
          ui_select_category_hint: d.ui_select_category_hint ?? '',
          ui_select_category_hint_es: d.ui_select_category_hint_es ?? '',
          ui_no_services: d.ui_no_services ?? '',
          ui_no_services_es: d.ui_no_services_es ?? '',
          ui_select_region: d.ui_select_region ?? '',
          ui_select_region_es: d.ui_select_region_es ?? '',
          ui_accept_terms: d.ui_accept_terms ?? '',
          ui_accept_terms_es: d.ui_accept_terms_es ?? '',
          ui_payment_method_label: d.ui_payment_method_label ?? '',
          ui_payment_method_label_es: d.ui_payment_method_label_es ?? '',
          ui_total_to_pay: d.ui_total_to_pay ?? '',
          ui_total_to_pay_es: d.ui_total_to_pay_es ?? '',
          ui_important_notice: d.ui_important_notice ?? '',
          ui_important_notice_es: d.ui_important_notice_es ?? '',
          ui_estimated_delivery: d.ui_estimated_delivery ?? '',
          ui_estimated_delivery_es: d.ui_estimated_delivery_es ?? '',
          ui_pay_now: d.ui_pay_now ?? '',
          ui_pay_now_es: d.ui_pay_now_es ?? '',
          ui_cancel: d.ui_cancel ?? '',
          ui_cancel_es: d.ui_cancel_es ?? '',
          ui_discount_code_label: d.ui_discount_code_label ?? '',
          ui_discount_code_label_es: d.ui_discount_code_label_es ?? '',
          ui_discount_placeholder: d.ui_discount_placeholder ?? '',
          ui_discount_placeholder_es: d.ui_discount_placeholder_es ?? '',
          ui_discount_apply: d.ui_discount_apply ?? '',
          ui_discount_apply_es: d.ui_discount_apply_es ?? '',
          ui_buy_button: d.ui_buy_button ?? '',
          ui_buy_button_es: d.ui_buy_button_es ?? '',
          ui_currency_label: d.ui_currency_label ?? '',
          ui_currency_label_es: d.ui_currency_label_es ?? '',
          ui_checkout: d.ui_checkout ?? '',
          ui_checkout_es: d.ui_checkout_es ?? '',
          ui_paypal_label: d.ui_paypal_label ?? '',
          ui_paypal_label_es: d.ui_paypal_label_es ?? '',
          ui_card_label: d.ui_card_label ?? '',
          ui_card_label_es: d.ui_card_label_es ?? '',
          ui_saved: d.ui_saved ?? '',
          ui_saved_es: d.ui_saved_es ?? '',
          ui_discount_off: d.ui_discount_off ?? '',
          ui_discount_off_es: d.ui_discount_off_es ?? '',
          ui_search_placeholder: d.ui_search_placeholder ?? '',
          ui_search_placeholder_es: d.ui_search_placeholder_es ?? '',
          ui_search_no_results: d.ui_search_no_results ?? '',
          ui_search_no_results_es: d.ui_search_no_results_es ?? '',
          ui_service_singular: d.ui_service_singular ?? '',
          ui_service_singular_es: d.ui_service_singular_es ?? '',
          ui_service_plural: d.ui_service_plural ?? '',
          ui_service_plural_es: d.ui_service_plural_es ?? '',
          ui_select_amount: d.ui_select_amount ?? '',
          ui_select_amount_es: d.ui_select_amount_es ?? '',
          ui_amount_singular: d.ui_amount_singular ?? '',
          ui_amount_singular_es: d.ui_amount_singular_es ?? '',
          ui_amount_plural: d.ui_amount_plural ?? '',
          ui_amount_plural_es: d.ui_amount_plural_es ?? '',
          ui_selected_prefix: d.ui_selected_prefix ?? '',
          ui_selected_prefix_es: d.ui_selected_prefix_es ?? '',
          ui_selected: d.ui_selected ?? '',
          ui_selected_es: d.ui_selected_es ?? '',
          ui_additional_singular: d.ui_additional_singular ?? '',
          ui_additional_singular_es: d.ui_additional_singular_es ?? '',
          ui_additional_plural: d.ui_additional_plural ?? '',
          ui_additional_plural_es: d.ui_additional_plural_es ?? '',
          ui_choose_placeholder: d.ui_choose_placeholder ?? '',
          ui_choose_placeholder_es: d.ui_choose_placeholder_es ?? '',
          ui_bar_from: d.ui_bar_from ?? '',
          ui_bar_from_es: d.ui_bar_from_es ?? '',
          ui_bar_to: d.ui_bar_to ?? '',
          ui_bar_to_es: d.ui_bar_to_es ?? '',
          footer_community_label: d.footer_community_label ?? '',
          footer_community_label_es: d.footer_community_label_es ?? '',
          footer_discord_label: d.footer_discord_label ?? '',
          footer_discord_label_es: d.footer_discord_label_es ?? '',
          footer_work_us_label: d.footer_work_us_label ?? '',
          footer_work_us_label_es: d.footer_work_us_label_es ?? '',
        });
      }
      if (featuresResult.success && featuresResult.data) {
        setFeatures(featuresResult.data);
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

      <ConfigForm initial={config} initialFeatures={features} />
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
