import { sql } from '@vercel/postgres';

async function checkOrders() {
  try {
    console.log('=== SERVICIOS ===');
    const services = await sql`
      SELECT category_id, id, title, display_order 
      FROM services 
      ORDER BY category_id, display_order
    `;
    
    console.table(services.rows);
    
    console.log('\n=== CATEGORÍAS ===');
    const categories = await sql`
      SELECT id, name, display_order 
      FROM categories 
      ORDER BY display_order
    `;
    
    console.table(categories.rows);
    
    // Verificar duplicados en servicios
    console.log('\n=== SERVICIOS CON DISPLAY_ORDER DUPLICADO ===');
    const duplicateServices = await sql`
      SELECT category_id, display_order, COUNT(*) as count
      FROM services
      GROUP BY category_id, display_order
      HAVING COUNT(*) > 1
    `;
    console.table(duplicateServices.rows);
    
    // Verificar duplicados en categorías
    console.log('\n=== CATEGORÍAS CON DISPLAY_ORDER DUPLICADO ===');
    const duplicateCategories = await sql`
      SELECT display_order, COUNT(*) as count
      FROM categories
      GROUP BY display_order
      HAVING COUNT(*) > 1
    `;
    console.table(duplicateCategories.rows);
    
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkOrders();
