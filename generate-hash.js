// Script temporal para generar hash de contraseña
// Ejecutar con: node generate-hash.js

import bcrypt from 'bcryptjs';

const password = 'Admin123!';
const saltRounds = 10;

const hash = await bcrypt.hash(password, saltRounds);
console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nCopia este hash en la base de datos:');
console.log(hash);
