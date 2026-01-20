'use server';

import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function resetDatabase() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  try {
    // PARTE 1: Limpiar y crear estructura
    await sql`DROP TABLE IF EXISTS service_prices CASCADE`;
    await sql`DROP TABLE IF EXISTS service_games CASCADE`;
    await sql`DROP TABLE IF EXISTS category_games CASCADE`;
    await sql`DROP TABLE IF EXISTS services CASCADE`;
    await sql`DROP TABLE IF EXISTS categories CASCADE`;
    await sql`DROP TABLE IF EXISTS games CASCADE`;
    await sql`DROP TABLE IF EXISTS sessions CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    await sql`DROP TABLE IF EXISTS accordion_items CASCADE`;
    await sql`DROP TABLE IF EXISTS home_features CASCADE`;
    await sql`DROP TABLE IF EXISTS payment_methods CASCADE`;
    await sql`DROP TABLE IF EXISTS site_config CASCADE`;
    await sql`DROP FUNCTION IF EXISTS update_updated_at_column CASCADE`;

    // Crear tablas
    await sql`CREATE TABLE IF NOT EXISTS users (id VARCHAR(21) PRIMARY KEY,email VARCHAR(255) UNIQUE NOT NULL,password_hash TEXT NOT NULL,role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin','user')),created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
    await sql`CREATE INDEX idx_users_email ON users(email)`;

    await sql`CREATE TABLE IF NOT EXISTS sessions (id VARCHAR(40) PRIMARY KEY,user_id VARCHAR(21) NOT NULL,expires_at TIMESTAMP NOT NULL,FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`;
    await sql`CREATE INDEX idx_sessions_user_id ON sessions(user_id)`;
    await sql`CREATE INDEX idx_sessions_expires_at ON sessions(expires_at)`;

    await sql`CREATE TABLE IF NOT EXISTS games (id VARCHAR(50) PRIMARY KEY,title VARCHAR(255) NOT NULL,category VARCHAR(100) NOT NULL,image TEXT NOT NULL,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
    await sql`CREATE INDEX idx_games_category ON games(category)`;

    await sql`CREATE TABLE IF NOT EXISTS categories (id VARCHAR(100) PRIMARY KEY,name VARCHAR(255) NOT NULL,description TEXT NOT NULL,icon VARCHAR(50) NOT NULL,display_order INTEGER NOT NULL DEFAULT 1,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
    await sql`CREATE INDEX idx_categories_display_order ON categories(display_order)`;

    await sql`CREATE TABLE IF NOT EXISTS category_games (category_id VARCHAR(100) NOT NULL,game_id VARCHAR(50) NOT NULL,PRIMARY KEY (category_id,game_id),FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE)`;
    await sql`CREATE INDEX idx_category_games_category_id ON category_games(category_id)`;
    await sql`CREATE INDEX idx_category_games_game_id ON category_games(game_id)`;

    await sql`CREATE TABLE IF NOT EXISTS services (id VARCHAR(50) PRIMARY KEY,title VARCHAR(255) NOT NULL,category_id VARCHAR(100) NOT NULL,price DECIMAL(10,2) NOT NULL,image TEXT NOT NULL,description TEXT[] NOT NULL,service_points TEXT[] DEFAULT ARRAY[]::TEXT[],display_order INTEGER NOT NULL DEFAULT 1,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT)`;
    await sql`CREATE INDEX idx_services_category_id ON services(category_id)`;
    await sql`CREATE INDEX idx_services_price ON services(price)`;
    await sql`CREATE INDEX idx_services_display_order ON services(display_order)`;

    await sql`CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE plpgsql`;
    await sql`CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;

    await sql`CREATE TABLE IF NOT EXISTS service_games (service_id VARCHAR(50) NOT NULL,game_id VARCHAR(50) NOT NULL,PRIMARY KEY (service_id,game_id),FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE)`;
    await sql`CREATE INDEX idx_service_games_service_id ON service_games(service_id)`;
    await sql`CREATE INDEX idx_service_games_game_id ON service_games(game_id)`;

    await sql`CREATE TABLE IF NOT EXISTS service_prices (id UUID PRIMARY KEY DEFAULT gen_random_uuid(),service_id VARCHAR(50) NOT NULL,type VARCHAR(50) NOT NULL CHECK (type IN ('bar','box','custom','selectors','additional','boxtitle','labeltitle')),config JSONB NOT NULL,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE)`;
    await sql`CREATE INDEX idx_service_prices_service_id ON service_prices(service_id)`;
    await sql`CREATE INDEX idx_service_prices_type ON service_prices(type)`;
    await sql`CREATE INDEX idx_service_prices_config ON service_prices USING GIN (config)`;
    await sql`CREATE INDEX idx_service_prices_created_at ON service_prices(created_at)`;


    await sql`CREATE TABLE IF NOT EXISTS accordion_items (id VARCHAR(50) PRIMARY KEY,title VARCHAR(255) NOT NULL,content TEXT NOT NULL,display_order INTEGER NOT NULL,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
    await sql`CREATE INDEX idx_accordion_items_order ON accordion_items(display_order)`;

    await sql`CREATE TABLE IF NOT EXISTS home_features (id UUID PRIMARY KEY DEFAULT gen_random_uuid(),icon VARCHAR(50) NOT NULL,title VARCHAR(255) NOT NULL,description TEXT NOT NULL,display_order INTEGER NOT NULL,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
    await sql`CREATE INDEX idx_home_features_order ON home_features(display_order)`;

    await sql`CREATE TABLE IF NOT EXISTS payment_methods (id UUID PRIMARY KEY DEFAULT gen_random_uuid(),name VARCHAR(100) NOT NULL,icon VARCHAR(50) NOT NULL,type VARCHAR(50) NOT NULL,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

    await sql`CREATE TABLE IF NOT EXISTS site_config (id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),logo_text VARCHAR(255) NOT NULL,home_title VARCHAR(255) NOT NULL,home_subtitle TEXT NOT NULL,home_categories TEXT[] NOT NULL,accordion_title VARCHAR(255) NOT NULL DEFAULT 'Frequently Asked Questions',footer_payment_title VARCHAR(255) NOT NULL,footer_copyright TEXT NOT NULL,disclaimer TEXT,discord_link TEXT,discord_work_us TEXT,payment_disclaimer TEXT,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
    await sql`CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON site_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;

    // PARTE 2: Insertar datos
    await sql`INSERT INTO users (id,email,password_hash,role) VALUES ('admin_default_user_1','admin@battleboost.com','$2b$10$eJQMEYnprXM16upaeFrN4OfkYZfbSdEUkoypbJMTlHy3pSVjZDpLS','admin')`;

    await sql`INSERT INTO games (id,title,category,image) VALUES ('game-1','Nexus Warriors','MMO','/images/games/nexus-warriors.jpg'),('game-2','Void Legends','MOBA','/images/games/void-legends.jpg'),('game-3','Eternal Realms','RPG','/images/games/eternal-realms.jpg'),('game-4','Cyber Strike','FPS','/images/games/cyber-strike.jpg')`;

    await sql`INSERT INTO categories (id,name,description,icon,display_order) VALUES ('power-leveling','Power Leveling','Fast and efficient character leveling services to reach maximum level quickly','Zap',1),('ranked-boosting','Ranked Boosting','Professional rank climbing services by experienced players to reach your desired tier','Trophy',2),('achievement-hunting','Achievement Hunting','Complete difficult achievements and unlock exclusive rewards and titles','Award',3),('gear-farming','Gear Farming','Obtain the best equipment and legendary items with optimized farming strategies','Shield',4),('dungeon-carries','Dungeon Carries','Expert dungeon runs with guaranteed loot and efficient completion times','Swords',5),('pvp-training','PvP Training','Learn advanced PvP techniques and strategies from professional players','Sword',6),('raid-completion','Raid Completion','Full raid clears with experienced teams, including all bosses and exclusive rewards','Users',7),('character-customization','Character Customization','Transform your character with premium cosmetics, skins and exclusive appearance items','Palette',8)`;

    await sql`INSERT INTO category_games (category_id,game_id) VALUES ('power-leveling','game-1'),('power-leveling','game-3'),('ranked-boosting','game-2'),('ranked-boosting','game-4'),('achievement-hunting','game-1'),('achievement-hunting','game-2'),('achievement-hunting','game-3'),('achievement-hunting','game-4'),('gear-farming','game-1'),('gear-farming','game-3'),('dungeon-carries','game-1'),('pvp-training','game-2'),('pvp-training','game-4'),('raid-completion','game-1'),('raid-completion','game-3'),('character-customization','game-1'),('character-customization','game-2'),('character-customization','game-3'),('character-customization','game-4')`;

    await sql`INSERT INTO services (id,title,category_id,price,image,description,display_order) VALUES ('pl-1','Level 1-50 Express','power-leveling',25.00,'/images/services/leveling-1.jpg',ARRAY['Fast boost from level 1 to 50','Completed in 24-48 hours','Basic equipment included'],1),('pl-2','Max Level Premium','power-leveling',45.00,'/images/services/leveling-2.jpg',ARRAY['Maximum level guaranteed','Epic equipment included','24/7 support'],2),('rb-1','Bronze to Gold','ranked-boosting',35.00,'/images/services/ranked-1.jpg',ARRAY['Guaranteed climb to Gold','Professional players','Live streaming available'],1),('rb-2','Platinum Package','ranked-boosting',65.00,'/images/services/ranked-2.jpg',ARRAY['Reach Platinum rank','Priority queue','Coaching included'],2),('ah-1','Achievement Bundle Basic','achievement-hunting',20.00,'/images/services/achievement-1.jpg',ARRAY['10 achievements of your choice','Completed in 3-5 days','Detailed guide included'],1),('ah-2','100% Completion','achievement-hunting',75.00,'/images/services/achievement-2.jpg',ARRAY['All game achievements','Rare titles and rewards','Completion guarantee'],2),('gf-1','Epic Gear Set','gear-farming',30.00,'/images/services/gear-1.jpg',ARRAY['Complete epic gear set','Optimized stats','Efficient farming'],1),('gf-2','Legendary Weapons','gear-farming',50.00,'/images/services/gear-2.jpg',ARRAY['Exclusive legendary weapons','Premium enchants','Improved drop rate'],2),('dc-1','Normal Dungeon Pack','dungeon-carries',15.00,'/images/services/dungeon-1.jpg',ARRAY['5 normal dungeons','All loot reserved for you','Completed in 2 hours'],1),('dc-2','Mythic+ Bundle','dungeon-carries',55.00,'/images/services/dungeon-2.jpg',ARRAY['Mythic+15 dungeons','Experienced group','Guaranteed loot'],2),('pvp-1','PvP Basics','pvp-training',25.00,'/images/services/pvp-1.jpg',ARRAY['PvP combat fundamentals','5 training sessions','Replay analysis'],1),('pvp-2','Arena Mastery','pvp-training',60.00,'/images/services/pvp-2.jpg',ARRAY['Advanced arena training','Team strategies','Personalized coaching'],2),('rc-1','Normal Raid Clear','raid-completion',40.00,'/images/services/raid-1.jpg',ARRAY['Full raid on normal difficulty','All loot reserved','Organized group'],1),('rc-2','Heroic Full Clear','raid-completion',80.00,'/images/services/raid-2.jpg',ARRAY['Full heroic raid','Mounts and titles included','Top guild carry'],2),('cc-1','Appearance Makeover','character-customization',10.00,'/images/services/custom-1.jpg',ARRAY['Complete appearance change','Style consultation','Exclusive skins'],1),('cc-2','Premium Cosmetics','character-customization',35.00,'/images/services/custom-2.jpg',ARRAY['Premium cosmetics pack','Seasonal items','Special effects'],2)`;

    await sql`INSERT INTO service_games (service_id,game_id) VALUES ('pl-1','game-1'),('pl-1','game-3'),('pl-2','game-1'),('pl-2','game-3'),('rb-1','game-2'),('rb-1','game-4'),('rb-2','game-2'),('rb-2','game-4'),('ah-1','game-1'),('ah-1','game-2'),('ah-1','game-3'),('ah-1','game-4'),('ah-2','game-1'),('ah-2','game-2'),('ah-2','game-3'),('ah-2','game-4'),('gf-1','game-1'),('gf-1','game-3'),('gf-2','game-1'),('gf-2','game-3'),('dc-1','game-1'),('dc-2','game-1'),('pvp-1','game-2'),('pvp-1','game-4'),('pvp-2','game-2'),('rc-1','game-1'),('rc-1','game-3'),('rc-2','game-1'),('rc-2','game-3'),('cc-1','game-1'),('cc-1','game-2'),('cc-1','game-3'),('cc-1','game-4'),('cc-2','game-1'),('cc-2','game-2'),('cc-2','game-3'),('cc-2','game-4')`;

    // Service prices con JSONB
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('pl-1','bar','{"initValue":1,"finalValue":50,"step":1,"label":"Select Level"}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('pl-1','additional','{"addOption1":{"type":"checkbox","value":10,"label":"Priority Queue"},"addOption2":{"type":"checkbox","value":15,"label":"Express Boost (12h)"},"addOption3":{"type":"checkbox","value":8,"label":"Stream Service"}}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('pl-2','box','{"options":[{"label":"Basic","value":10},{"label":"Standard","value":20},{"label":"Advanced","value":30},{"label":"Premium","value":45},{"label":"Elite","value":60},{"label":"Ultimate","value":80}]}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('rb-1','bar','{"initValue":500,"finalValue":2000,"step":100,"label":"Select Rating (MMR)"}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('rb-1','additional','{"addOption1":{"type":"checkbox","value":20,"label":"Duo Queue"},"addOption2":{"type":"checkbox","value":12,"label":"Specific Champion"}}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('rb-2','box','{"options":[{"label":"Bronze","value":15},{"label":"Silver","value":25},{"label":"Gold","value":40},{"label":"Platinum","value":65},{"label":"Diamond","value":90}]}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('ah-1','box','{"options":[{"label":"Starter","value":5},{"label":"Basic","value":10},{"label":"Standard","value":20},{"label":"Advanced","value":35},{"label":"Pro","value":50},{"label":"Master","value":75}]}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('ah-2','bar','{"initValue":10,"finalValue":100,"step":5,"label":"Select Achievement Count"}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('ah-2','box','{"options":[{"label":"$15","value":15},{"label":"$30","value":30},{"label":"$50","value":50},{"label":"$75","value":75}]}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('ah-2','additional','{"addOption1":{"type":"checkbox","value":25,"label":"Rare Achievements"},"addOption2":{"type":"checkbox","value":15,"label":"Secret Achievements"}}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('ah-2','labeltitle','{"title":"📋 What''s Included"}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('ah-2','boxtitle','{"options":[{"label":"ETA","value":"1-3 business days"},{"label":"Includes","value":"All achievements + bonus content"},{"label":"Support","value":"24/7 live chat"}]}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('gf-1','bar','{"initValue":100,"finalValue":300,"step":10,"label":"Select Item Level"}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('gf-1','additional','{"addOption1":{"type":"checkbox","value":25,"label":"Best in Slot Items"},"addOption2":{"type":"checkbox","value":15,"label":"Enchant All Items"},"addOption3":{"type":"checkbox","value":10,"label":"Socket Gems"}}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('gf-2','box','{"options":[{"label":"Common","value":20},{"label":"Rare","value":35},{"label":"Epic","value":50},{"label":"Legendary","value":70},{"label":"Mythic","value":100}]}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('dc-1','custom','{"label":"Select Amount","presets":[5,10,15,25]}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('dc-1','selectors','{"Choose number of characters":[{"label":"1 Character","value":0},{"label":"2 Characters","value":90},{"label":"5 Characters","value":375},{"label":"6 Characters","value":470},{"label":"12 Characters","value":1070}]}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('dc-2','bar','{"initValue":5,"finalValue":20,"step":1,"label":"Select Mythic+ Level"}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('dc-2','additional','{"addOption1":{"type":"checkbox","value":30,"label":"Timed Run Guarantee"},"addOption2":{"type":"checkbox","value":20,"label":"Specific Loot Priority"}}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('pvp-1','custom','{"label":"Training Sessions","presets":[10,25,40,60]}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('pvp-2','custom','{"label":"Advanced Coaching","presets":[30,60,90,120]}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('pvp-2','selectors','{"Select Difficulty":[{"label":"Beginner","value":0},{"label":"Intermediate","value":25},{"label":"Advanced","value":50},{"label":"Expert","value":85},{"label":"Master","value":120}],"Choose Arena Type":[{"label":"2v2 Arena","value":0},{"label":"3v3 Arena","value":35},{"label":"5v5 Battleground","value":45}]}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('rc-1','custom','{"label":"Select Price","presets":[20,40,60,80]}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('rc-2','custom','{"label":"Choose Amount","presets":[50,80,100,150]}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('rc-2','selectors','{"Raid Group Size":[{"label":"10 Players","value":0},{"label":"15 Players","value":45},{"label":"20 Players","value":80},{"label":"25 Players","value":120}]}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('cc-1','custom','{"label":"Select Price","presets":[5,10,15,20]}'::jsonb)`;
    await sql`INSERT INTO service_prices (service_id,type,config) VALUES ('cc-2','custom','{"label":"Custom Amount","presets":[20,35,50,75]}'::jsonb)`;

    // Accordion items
    await sql`INSERT INTO accordion_items (id,title,content,display_order) VALUES ('item-1','What is your boosting process?','Our boosting process is completely secure and confidential. We use VPN protection and work during your preferred schedule. All our boosters are verified professionals with years of experience in the gaming industry.',1),('item-2','How long does delivery take?','Delivery times vary depending on the service selected. Most orders are completed within 24-48 hours. For larger orders, we provide a detailed timeline before starting the service.',2),('item-3','Is my account safe?','Absolutely! We take account security very seriously. All boosters use VPN services, we never share your information with third parties, and we follow strict security protocols to ensure your account remains protected.',3),('item-4','What payment methods do you accept?','We accept PayPal and all major credit/debit cards. All transactions are processed securely through encrypted payment gateways to ensure your financial information is protected.',4),('item-5','Do you offer refunds?','Yes, we offer refunds under specific circumstances. If we fail to deliver the service as promised or if there are issues on our end, you are eligible for a full refund. Please review our refund policy for more details.',5),('item-6','Can I track my order progress?','Absolutely! Once your order is confirmed, you''ll receive access to our real-time tracking dashboard. You can monitor progress 24/7, communicate with your booster, and receive instant notifications about milestones and completion.',6),('item-7','What regions do you support?','We provide services for all major regions including NA, EU, Asia, OCE, and Latin America. Our boosters are distributed globally to ensure optimal connection quality and service availability in your region.',7),('item-8','Do you use VPN protection?','Yes, all our boosters are required to use premium VPN services that match your location. This ensures your account remains secure and undetected, maintaining the highest level of protection throughout the entire service.',8),('item-9','How experienced are your boosters?','All our boosters are carefully vetted professionals with minimum 5 years of gaming experience. They maintain top rankings in their respective games and undergo regular performance evaluations to ensure quality service delivery.',9),('item-10','Can I pause my order?','Yes, you can pause your order at any time through your dashboard or by contacting our support team. We understand that life happens, and we''re flexible to accommodate your schedule and needs.',10),('item-11','What if I''m not satisfied with the service?','Customer satisfaction is our priority. If you''re not happy with our service, contact us within 48 hours of completion. We''ll either redo the service at no extra cost or provide a full refund based on the circumstances.',11),('item-12','Do you offer coaching services?','Yes! In addition to boosting, we offer personalized coaching sessions where expert players will teach you strategies, mechanics, and game knowledge to help you improve your own skills and climb the ranks independently.',12),('item-13','Is there a loyalty program?','Absolutely! Our loyalty program rewards returning customers with points for every purchase, exclusive discounts, priority queue access, and special offers. Points can be redeemed for discounts on future orders.',13),('item-14','How do you handle my personal information?','We take data privacy seriously. All personal information is encrypted using industry-standard protocols, stored securely, and never shared with third parties. We comply with GDPR and other international data protection regulations.',14),('item-15','Can I request a specific booster?','Yes! If you''ve had a positive experience with a particular booster, you can request them for your next order. While we can''t always guarantee availability, we''ll do our best to accommodate your preference.',15)`;

    await sql`INSERT INTO home_features (icon,title,description,display_order) VALUES ('Shield','Secure & Safe','Advanced encryption and account protection throughout the entire boosting process',1),('Zap','Fast Delivery','Professional players ensure quick and efficient service completion',2),('Crown','Premium Quality','Top-tier boosters with proven track records and excellent reviews',3),('Headphones','24/7 Support','Always available customer support to assist you anytime, anywhere',4)`;

    await sql`INSERT INTO payment_methods (name,icon,type) VALUES ('PayPal','paypal','paypal'),('Visa/Mastercard','credit-card','card')`;

    await sql`INSERT INTO site_config (id,logo_text,home_title,home_subtitle,home_categories,accordion_title,footer_payment_title,footer_copyright,disclaimer,discord_link,discord_work_us,payment_disclaimer) VALUES (1,'BATTLE BOOSTING','BattleBoosting Gaming Services','Your trusted platform for professional gaming services',ARRAY['MMO Boosting','Ranked Services','Power Leveling','Achievement Hunting'],'Frequently Asked Questions','Accepted payment methods','© 2025 BattleBoosting. All rights reserved.','All services are provided for entertainment purposes only. We are not affiliated with any game developers or publishers.','https://discord.gg/battleboost','https://discord.gg/battleboost-jobs','After completing your payment, please create a ticket in our Discord server to start your order. Join BattleBoost Discord community for support!')`;

    revalidatePath('/dashboard');
    return { success: true, message: 'Base de datos reiniciada exitosamente' };
  } catch (error) {
    console.error('Error resetting database:', error);
    return { success: false, error: 'Error al reiniciar la base de datos: ' + (error as Error).message };
  }
}
