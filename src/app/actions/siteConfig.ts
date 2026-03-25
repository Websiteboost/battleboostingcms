'use server';

import { sql } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { z } from "zod";

const siteConfigSchema = z.object({
  logo_text: z.string().min(1, { message: "El texto del logo es requerido" }),
  home_title: z.string().min(1, { message: "El título es requerido" }),
  home_subtitle: z.string().min(1, { message: "El subtítulo es requerido" }),
  home_categories: z.array(z.string()).min(1, { message: "Debe haber al menos una categoría" }),
  accordion_title: z.string().min(1, { message: "El título del acordeón es requerido" }),
  footer_payment_title: z.string().min(1, { message: "El título de pago es requerido" }),
  footer_copyright: z.string().min(1, { message: "El copyright es requerido" }),
  disclaimer: z.string().min(1, { message: "El disclaimer es requerido" }),
  discord_link: z.string().optional(),
  discord_work_us: z.string().optional(),
  payment_disclaimer: z.string().optional(),
  euro_value: z.coerce.number().optional().default(1.08),
  logo_url: z.string().optional(),
  home_title_es: z.string().optional().nullable(),
  home_subtitle_es: z.string().optional().nullable(),
  accordion_title_es: z.string().optional().nullable(),
  footer_payment_title_es: z.string().optional().nullable(),
  footer_copyright_es: z.string().optional().nullable(),
  payment_disclaimer_es: z.string().optional().nullable(),
  disclaimer_es: z.string().optional().nullable(),
  home_categories_es: z.array(z.string()).optional().nullable(),
  ui_services_label: z.string().optional().nullable(),
  ui_services_label_es: z.string().optional().nullable(),
  ui_categories_label: z.string().optional().nullable(),
  ui_categories_label_es: z.string().optional().nullable(),
  ui_back_to_categories: z.string().optional().nullable(),
  ui_back_to_categories_es: z.string().optional().nullable(),
  ui_select_category_hint: z.string().optional().nullable(),
  ui_select_category_hint_es: z.string().optional().nullable(),
  ui_no_services: z.string().optional().nullable(),
  ui_no_services_es: z.string().optional().nullable(),
  ui_select_region: z.string().optional().nullable(),
  ui_select_region_es: z.string().optional().nullable(),
  ui_accept_terms: z.string().optional().nullable(),
  ui_accept_terms_es: z.string().optional().nullable(),
  ui_payment_method_label: z.string().optional().nullable(),
  ui_payment_method_label_es: z.string().optional().nullable(),
  ui_total_to_pay: z.string().optional().nullable(),
  ui_total_to_pay_es: z.string().optional().nullable(),
  ui_important_notice: z.string().optional().nullable(),
  ui_important_notice_es: z.string().optional().nullable(),
  ui_estimated_delivery: z.string().optional().nullable(),
  ui_estimated_delivery_es: z.string().optional().nullable(),
  ui_pay_now: z.string().optional().nullable(),
  ui_pay_now_es: z.string().optional().nullable(),
  ui_cancel: z.string().optional().nullable(),
  ui_cancel_es: z.string().optional().nullable(),
  ui_discount_code_label: z.string().optional().nullable(),
  ui_discount_code_label_es: z.string().optional().nullable(),
  ui_discount_placeholder: z.string().optional().nullable(),
  ui_discount_placeholder_es: z.string().optional().nullable(),
  ui_discount_apply: z.string().optional().nullable(),
  ui_discount_apply_es: z.string().optional().nullable(),
  ui_buy_button: z.string().optional().nullable(),
  ui_buy_button_es: z.string().optional().nullable(),
  ui_currency_label: z.string().optional().nullable(),
  ui_currency_label_es: z.string().optional().nullable(),
  ui_checkout: z.string().optional().nullable(),
  ui_checkout_es: z.string().optional().nullable(),
  ui_paypal_label: z.string().optional().nullable(),
  ui_paypal_label_es: z.string().optional().nullable(),
  ui_card_label: z.string().optional().nullable(),
  ui_card_label_es: z.string().optional().nullable(),
  ui_saved: z.string().optional().nullable(),
  ui_saved_es: z.string().optional().nullable(),
  ui_discount_off: z.string().optional().nullable(),
  ui_discount_off_es: z.string().optional().nullable(),
  ui_search_placeholder: z.string().optional().nullable(),
  ui_search_placeholder_es: z.string().optional().nullable(),
  ui_search_no_results: z.string().optional().nullable(),
  ui_search_no_results_es: z.string().optional().nullable(),
  ui_service_singular: z.string().optional().nullable(),
  ui_service_singular_es: z.string().optional().nullable(),
  ui_service_plural: z.string().optional().nullable(),
  ui_service_plural_es: z.string().optional().nullable(),
  ui_select_amount: z.string().optional().nullable(),
  ui_select_amount_es: z.string().optional().nullable(),
  ui_amount_singular: z.string().optional().nullable(),
  ui_amount_singular_es: z.string().optional().nullable(),
  ui_amount_plural: z.string().optional().nullable(),
  ui_amount_plural_es: z.string().optional().nullable(),
  ui_selected_prefix: z.string().optional().nullable(),
  ui_selected_prefix_es: z.string().optional().nullable(),
  ui_selected: z.string().optional().nullable(),
  ui_selected_es: z.string().optional().nullable(),
  ui_additional_singular: z.string().optional().nullable(),
  ui_additional_singular_es: z.string().optional().nullable(),
  ui_additional_plural: z.string().optional().nullable(),
  ui_additional_plural_es: z.string().optional().nullable(),
  ui_choose_placeholder: z.string().optional().nullable(),
  ui_choose_placeholder_es: z.string().optional().nullable(),
  ui_bar_from: z.string().optional().nullable(),
  ui_bar_from_es: z.string().optional().nullable(),
  ui_bar_to: z.string().optional().nullable(),
  ui_bar_to_es: z.string().optional().nullable(),
  footer_community_label: z.string().optional().nullable(),
  footer_community_label_es: z.string().optional().nullable(),
  footer_discord_label: z.string().optional().nullable(),
  footer_discord_label_es: z.string().optional().nullable(),
  footer_work_us_label: z.string().optional().nullable(),
  footer_work_us_label_es: z.string().optional().nullable(),
});

export async function getSiteConfig() {
  noStore();
  try {
    const result = await sql`
      SELECT * FROM site_config WHERE id = 1
    `;
    return { success: true, data: result[0] || null };
  } catch (error) {
    console.error('Error fetching site config:', error);
    return { success: false, error: 'Error al obtener la configuración' };
  }
}

export async function updateSiteConfig(data: z.infer<typeof siteConfigSchema>) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  const validatedFields = siteConfigSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, error: 'Datos inválidos' };
  }

  const { logo_text, home_title, home_subtitle, home_categories, accordion_title, footer_payment_title, footer_copyright, disclaimer, discord_link, discord_work_us, payment_disclaimer, euro_value, logo_url, home_title_es, home_subtitle_es, accordion_title_es, footer_payment_title_es, footer_copyright_es, payment_disclaimer_es, disclaimer_es, home_categories_es, ui_services_label, ui_services_label_es, ui_categories_label, ui_categories_label_es, ui_back_to_categories, ui_back_to_categories_es, ui_select_category_hint, ui_select_category_hint_es, ui_no_services, ui_no_services_es, ui_select_region, ui_select_region_es, ui_accept_terms, ui_accept_terms_es, ui_payment_method_label, ui_payment_method_label_es, ui_total_to_pay, ui_total_to_pay_es, ui_important_notice, ui_important_notice_es, ui_estimated_delivery, ui_estimated_delivery_es, ui_pay_now, ui_pay_now_es, ui_cancel, ui_cancel_es, ui_discount_code_label, ui_discount_code_label_es, ui_discount_placeholder, ui_discount_placeholder_es, ui_discount_apply, ui_discount_apply_es, ui_buy_button, ui_buy_button_es, ui_currency_label, ui_currency_label_es, ui_checkout, ui_checkout_es, ui_paypal_label, ui_paypal_label_es, ui_card_label, ui_card_label_es, ui_saved, ui_saved_es, ui_discount_off, ui_discount_off_es, ui_search_placeholder, ui_search_placeholder_es, ui_search_no_results, ui_search_no_results_es, ui_service_singular, ui_service_singular_es, ui_service_plural, ui_service_plural_es, ui_select_amount, ui_select_amount_es, ui_amount_singular, ui_amount_singular_es, ui_amount_plural, ui_amount_plural_es, ui_selected_prefix, ui_selected_prefix_es, ui_selected, ui_selected_es, ui_additional_singular, ui_additional_singular_es, ui_additional_plural, ui_additional_plural_es, ui_choose_placeholder, ui_choose_placeholder_es, ui_bar_from, ui_bar_from_es, ui_bar_to, ui_bar_to_es, footer_community_label, footer_community_label_es, footer_discord_label, footer_discord_label_es, footer_work_us_label, footer_work_us_label_es } = validatedFields.data;

  try {
    // Usar UPSERT (INSERT ... ON CONFLICT)
    await sql`
      INSERT INTO site_config (id, logo_text, home_title, home_subtitle, home_categories, accordion_title, footer_payment_title, footer_copyright, disclaimer, discord_link, discord_work_us, payment_disclaimer, euro_value, logo_url, home_title_es, home_subtitle_es, accordion_title_es, footer_payment_title_es, footer_copyright_es, payment_disclaimer_es, disclaimer_es, home_categories_es, ui_services_label, ui_services_label_es, ui_categories_label, ui_categories_label_es, ui_back_to_categories, ui_back_to_categories_es, ui_select_category_hint, ui_select_category_hint_es, ui_no_services, ui_no_services_es, ui_select_region, ui_select_region_es, ui_accept_terms, ui_accept_terms_es, ui_payment_method_label, ui_payment_method_label_es, ui_total_to_pay, ui_total_to_pay_es, ui_important_notice, ui_important_notice_es, ui_estimated_delivery, ui_estimated_delivery_es, ui_pay_now, ui_pay_now_es, ui_cancel, ui_cancel_es, ui_discount_code_label, ui_discount_code_label_es, ui_discount_placeholder, ui_discount_placeholder_es, ui_discount_apply, ui_discount_apply_es, ui_buy_button, ui_buy_button_es, ui_currency_label, ui_currency_label_es, ui_checkout, ui_checkout_es, ui_paypal_label, ui_paypal_label_es, ui_card_label, ui_card_label_es, ui_saved, ui_saved_es, ui_discount_off, ui_discount_off_es, ui_search_placeholder, ui_search_placeholder_es, ui_search_no_results, ui_search_no_results_es, ui_service_singular, ui_service_singular_es, ui_service_plural, ui_service_plural_es, ui_select_amount, ui_select_amount_es, ui_amount_singular, ui_amount_singular_es, ui_amount_plural, ui_amount_plural_es, ui_selected_prefix, ui_selected_prefix_es, ui_selected, ui_selected_es, ui_additional_singular, ui_additional_singular_es, ui_additional_plural, ui_additional_plural_es, ui_choose_placeholder, ui_choose_placeholder_es, ui_bar_from, ui_bar_from_es, ui_bar_to, ui_bar_to_es, footer_community_label, footer_community_label_es, footer_discord_label, footer_discord_label_es, footer_work_us_label, footer_work_us_label_es)
      VALUES (1, ${logo_text}, ${home_title}, ${home_subtitle}, ${home_categories}, ${accordion_title}, ${footer_payment_title}, ${footer_copyright}, ${disclaimer}, ${discord_link}, ${discord_work_us}, ${payment_disclaimer}, ${euro_value ?? 1.08}, ${logo_url ?? ''}, ${home_title_es ?? null}, ${home_subtitle_es ?? null}, ${accordion_title_es ?? null}, ${footer_payment_title_es ?? null}, ${footer_copyright_es ?? null}, ${payment_disclaimer_es ?? null}, ${disclaimer_es ?? null}, ${home_categories_es ?? null}, ${ui_services_label ?? null}, ${ui_services_label_es ?? null}, ${ui_categories_label ?? null}, ${ui_categories_label_es ?? null}, ${ui_back_to_categories ?? null}, ${ui_back_to_categories_es ?? null}, ${ui_select_category_hint ?? null}, ${ui_select_category_hint_es ?? null}, ${ui_no_services ?? null}, ${ui_no_services_es ?? null}, ${ui_select_region ?? null}, ${ui_select_region_es ?? null}, ${ui_accept_terms ?? null}, ${ui_accept_terms_es ?? null}, ${ui_payment_method_label ?? null}, ${ui_payment_method_label_es ?? null}, ${ui_total_to_pay ?? null}, ${ui_total_to_pay_es ?? null}, ${ui_important_notice ?? null}, ${ui_important_notice_es ?? null}, ${ui_estimated_delivery ?? null}, ${ui_estimated_delivery_es ?? null}, ${ui_pay_now ?? null}, ${ui_pay_now_es ?? null}, ${ui_cancel ?? null}, ${ui_cancel_es ?? null}, ${ui_discount_code_label ?? null}, ${ui_discount_code_label_es ?? null}, ${ui_discount_placeholder ?? null}, ${ui_discount_placeholder_es ?? null}, ${ui_discount_apply ?? null}, ${ui_discount_apply_es ?? null}, ${ui_buy_button ?? null}, ${ui_buy_button_es ?? null}, ${ui_currency_label ?? null}, ${ui_currency_label_es ?? null}, ${ui_checkout ?? null}, ${ui_checkout_es ?? null}, ${ui_paypal_label ?? null}, ${ui_paypal_label_es ?? null}, ${ui_card_label ?? null}, ${ui_card_label_es ?? null}, ${ui_saved ?? null}, ${ui_saved_es ?? null}, ${ui_discount_off ?? null}, ${ui_discount_off_es ?? null}, ${ui_search_placeholder ?? null}, ${ui_search_placeholder_es ?? null}, ${ui_search_no_results ?? null}, ${ui_search_no_results_es ?? null}, ${ui_service_singular ?? null}, ${ui_service_singular_es ?? null}, ${ui_service_plural ?? null}, ${ui_service_plural_es ?? null}, ${ui_select_amount ?? null}, ${ui_select_amount_es ?? null}, ${ui_amount_singular ?? null}, ${ui_amount_singular_es ?? null}, ${ui_amount_plural ?? null}, ${ui_amount_plural_es ?? null}, ${ui_selected_prefix ?? null}, ${ui_selected_prefix_es ?? null}, ${ui_selected ?? null}, ${ui_selected_es ?? null}, ${ui_additional_singular ?? null}, ${ui_additional_singular_es ?? null}, ${ui_additional_plural ?? null}, ${ui_additional_plural_es ?? null}, ${ui_choose_placeholder ?? null}, ${ui_choose_placeholder_es ?? null}, ${ui_bar_from ?? null}, ${ui_bar_from_es ?? null}, ${ui_bar_to ?? null}, ${ui_bar_to_es ?? null}, ${footer_community_label ?? null}, ${footer_community_label_es ?? null}, ${footer_discord_label ?? null}, ${footer_discord_label_es ?? null}, ${footer_work_us_label ?? null}, ${footer_work_us_label_es ?? null})
      ON CONFLICT (id)
      DO UPDATE SET
        logo_text = ${logo_text},
        home_title = ${home_title},
        home_subtitle = ${home_subtitle},
        home_categories = ${home_categories},
        accordion_title = ${accordion_title},
        footer_payment_title = ${footer_payment_title},
        footer_copyright = ${footer_copyright},
        disclaimer = ${disclaimer},
        discord_link = ${discord_link},
        discord_work_us = ${discord_work_us},
        payment_disclaimer = ${payment_disclaimer},
        euro_value = ${euro_value ?? 1.08},
        logo_url = ${logo_url ?? ''},
        home_title_es = ${home_title_es ?? null},
        home_subtitle_es = ${home_subtitle_es ?? null},
        accordion_title_es = ${accordion_title_es ?? null},
        footer_payment_title_es = ${footer_payment_title_es ?? null},
        footer_copyright_es = ${footer_copyright_es ?? null},
        payment_disclaimer_es = ${payment_disclaimer_es ?? null},
        disclaimer_es = ${disclaimer_es ?? null},
        home_categories_es = ${home_categories_es ?? null},
        ui_services_label = ${ui_services_label ?? null},
        ui_services_label_es = ${ui_services_label_es ?? null},
        ui_categories_label = ${ui_categories_label ?? null},
        ui_categories_label_es = ${ui_categories_label_es ?? null},
        ui_back_to_categories = ${ui_back_to_categories ?? null},
        ui_back_to_categories_es = ${ui_back_to_categories_es ?? null},
        ui_select_category_hint = ${ui_select_category_hint ?? null},
        ui_select_category_hint_es = ${ui_select_category_hint_es ?? null},
        ui_no_services = ${ui_no_services ?? null},
        ui_no_services_es = ${ui_no_services_es ?? null},
        ui_select_region = ${ui_select_region ?? null},
        ui_select_region_es = ${ui_select_region_es ?? null},
        ui_accept_terms = ${ui_accept_terms ?? null},
        ui_accept_terms_es = ${ui_accept_terms_es ?? null},
        ui_payment_method_label = ${ui_payment_method_label ?? null},
        ui_payment_method_label_es = ${ui_payment_method_label_es ?? null},
        ui_total_to_pay = ${ui_total_to_pay ?? null},
        ui_total_to_pay_es = ${ui_total_to_pay_es ?? null},
        ui_important_notice = ${ui_important_notice ?? null},
        ui_important_notice_es = ${ui_important_notice_es ?? null},
        ui_estimated_delivery = ${ui_estimated_delivery ?? null},
        ui_estimated_delivery_es = ${ui_estimated_delivery_es ?? null},
        ui_pay_now = ${ui_pay_now ?? null},
        ui_pay_now_es = ${ui_pay_now_es ?? null},
        ui_cancel = ${ui_cancel ?? null},
        ui_cancel_es = ${ui_cancel_es ?? null},
        ui_discount_code_label = ${ui_discount_code_label ?? null},
        ui_discount_code_label_es = ${ui_discount_code_label_es ?? null},
        ui_discount_placeholder = ${ui_discount_placeholder ?? null},
        ui_discount_placeholder_es = ${ui_discount_placeholder_es ?? null},
        ui_discount_apply = ${ui_discount_apply ?? null},
        ui_discount_apply_es = ${ui_discount_apply_es ?? null},
        ui_buy_button = ${ui_buy_button ?? null},
        ui_buy_button_es = ${ui_buy_button_es ?? null},
        ui_currency_label = ${ui_currency_label ?? null},
        ui_currency_label_es = ${ui_currency_label_es ?? null},
        ui_checkout = ${ui_checkout ?? null},
        ui_checkout_es = ${ui_checkout_es ?? null},
        ui_paypal_label = ${ui_paypal_label ?? null},
        ui_paypal_label_es = ${ui_paypal_label_es ?? null},
        ui_card_label = ${ui_card_label ?? null},
        ui_card_label_es = ${ui_card_label_es ?? null},
        ui_saved = ${ui_saved ?? null},
        ui_saved_es = ${ui_saved_es ?? null},
        ui_discount_off = ${ui_discount_off ?? null},
        ui_discount_off_es = ${ui_discount_off_es ?? null},
        ui_search_placeholder = ${ui_search_placeholder ?? null},
        ui_search_placeholder_es = ${ui_search_placeholder_es ?? null},
        ui_search_no_results = ${ui_search_no_results ?? null},
        ui_search_no_results_es = ${ui_search_no_results_es ?? null},
        ui_service_singular = ${ui_service_singular ?? null},
        ui_service_singular_es = ${ui_service_singular_es ?? null},
        ui_service_plural = ${ui_service_plural ?? null},
        ui_service_plural_es = ${ui_service_plural_es ?? null},
        ui_select_amount = ${ui_select_amount ?? null},
        ui_select_amount_es = ${ui_select_amount_es ?? null},
        ui_amount_singular = ${ui_amount_singular ?? null},
        ui_amount_singular_es = ${ui_amount_singular_es ?? null},
        ui_amount_plural = ${ui_amount_plural ?? null},
        ui_amount_plural_es = ${ui_amount_plural_es ?? null},
        ui_selected_prefix = ${ui_selected_prefix ?? null},
        ui_selected_prefix_es = ${ui_selected_prefix_es ?? null},
        ui_selected = ${ui_selected ?? null},
        ui_selected_es = ${ui_selected_es ?? null},
        ui_additional_singular = ${ui_additional_singular ?? null},
        ui_additional_singular_es = ${ui_additional_singular_es ?? null},
        ui_additional_plural = ${ui_additional_plural ?? null},
        ui_additional_plural_es = ${ui_additional_plural_es ?? null},
        ui_choose_placeholder = ${ui_choose_placeholder ?? null},
        ui_choose_placeholder_es = ${ui_choose_placeholder_es ?? null},
        ui_bar_from = ${ui_bar_from ?? null},
        ui_bar_from_es = ${ui_bar_from_es ?? null},
        ui_bar_to = ${ui_bar_to ?? null},
        ui_bar_to_es = ${ui_bar_to_es ?? null},
        footer_community_label = ${footer_community_label ?? null},
        footer_community_label_es = ${footer_community_label_es ?? null},
        footer_discord_label = ${footer_discord_label ?? null},
        footer_discord_label_es = ${footer_discord_label_es ?? null},
        footer_work_us_label = ${footer_work_us_label ?? null},
        footer_work_us_label_es = ${footer_work_us_label_es ?? null},
        updated_at = CURRENT_TIMESTAMP
    `;
    
    revalidatePath('/dashboard');
    return { success: true, message: 'Configuración actualizada exitosamente' };
  } catch (error) {
    console.error('Error updating site config:', error);
    return { success: false, error: 'Error al actualizar la configuración' };
  }
}
