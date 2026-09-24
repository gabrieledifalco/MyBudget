import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Categorie predefinite come da README (Modulo Spese).
const CATEGORIES = [
  ['Mutuo', 'HOME'],
  ['Affitto', 'HOME'],
  ['Bollette', 'HOME'],
  ['Condominio', 'HOME'],
  ['Internet', 'HOME'],
  ['Telefono', 'HOME'],
  ['Assicurazione auto', 'CAR'],
  ['Bollo', 'CAR'],
  ['Carburante', 'CAR'],
  ['Manutenzione auto', 'CAR'],
  ['Palestra', 'SPORT'],
  ['Attività sportive', 'SPORT'],
  ['Abbonamenti', 'SPORT'],
  ['Scuola', 'FAMILY'],
  ['Mensa', 'FAMILY'],
  ['Attività extrascolastiche', 'FAMILY'],
  ['Investimenti', 'INVESTMENT'],
  ['Tempo libero', 'LEISURE'],
  ['Altro', 'OTHER'],
];

async function main() {
  for (const [name, macroArea] of CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: { macroArea },
      create: { name, macroArea },
    });
  }
  console.log(`Seed completato: ${CATEGORIES.length} categorie.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
