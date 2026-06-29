/**
 * Seed idempotente de la base de datos.
 * Crea permisos, roles y su matriz, usuario administrador, sucursales y un
 * catálogo de servicios/exámenes (migrado y estructurado desde el sitio
 * actual: resuelve UI-1/UI-2 al ser fuente única de verdad).
 *
 * Ejecutar: `pnpm db:seed` (o `pnpm --filter @labocenter/api db:seed`).
 * Es seguro correrlo varias veces (usa upsert).
 */
import {
  ALL_PERMISSIONS,
  ROLE_NAMES,
  ROLE_PERMISSIONS,
  type RoleName,
} from "@labocenter/contracts";
import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";

const prisma = new PrismaClient();

/** Convierte un texto a slug URL-safe (sin acentos ni espacios). */
function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ───────────────────────── Catálogo de exámenes ─────────────────────────

interface SeedExam {
  name: string;
  code?: string;
  deliveryTime: string;
  requiresFasting?: boolean;
  priceReference?: number;
  description?: string;
  instructions?: string[];
}

interface SeedCategory {
  name: string;
  exams: SeedExam[];
}

interface SeedService {
  name: string;
  division: string;
  description?: string;
  categories: SeedCategory[];
}

const CATALOG: SeedService[] = [
  {
    name: "Laboratorio Clínico",
    division: "Apoyo y Laboratorio Clínico",
    description:
      "Exámenes de laboratorio oportunos, confiables y de calidad, procesados con tecnología robótica.",
    categories: [
      {
        name: "Bioquímica",
        exams: [
          {
            name: "Perfil Lipídico",
            deliveryTime: "1 día",
            requiresFasting: true,
            description:
              "Mide colesterol total, HDL, LDL y triglicéridos para evaluar riesgo cardiovascular.",
            instructions: [
              "Ayuno de 12 horas previo a la toma de muestra.",
              "Puede beber agua durante el ayuno.",
              "Evite alcohol las 24 horas previas.",
            ],
          },
          {
            name: "Glicemia en Ayunas",
            deliveryTime: "1 día",
            requiresFasting: true,
            description: "Mide el nivel de glucosa en sangre tras ayuno.",
            instructions: ["Ayuno de 8 horas.", "Puede beber agua."],
          },
          {
            name: "Perfil Hepático",
            deliveryTime: "1 día",
            requiresFasting: true,
            description: "Evalúa la función del hígado.",
            instructions: ["Ayuno de 8 horas."],
          },
          {
            name: "Creatinina",
            deliveryTime: "1 día",
            requiresFasting: false,
          },
        ],
      },
      {
        name: "Hematología",
        exams: [
          {
            name: "Hemograma Completo",
            deliveryTime: "1 día",
            requiresFasting: false,
            description:
              "Análisis de glóbulos rojos, blancos y plaquetas. No requiere preparación.",
          },
          {
            name: "VHS",
            deliveryTime: "1 día",
            requiresFasting: false,
          },
        ],
      },
      {
        name: "Hormonas",
        exams: [
          {
            name: "TSH",
            deliveryTime: "2 días",
            requiresFasting: false,
            description: "Hormona estimulante de la tiroides.",
          },
          {
            name: "Testosterona Total",
            deliveryTime: "3 días",
            requiresFasting: false,
            instructions: ["Idealmente tomar la muestra en la mañana."],
          },
        ],
      },
      {
        name: "Microbiología",
        exams: [
          {
            name: "Urocultivo",
            deliveryTime: "3 días",
            requiresFasting: false,
            instructions: [
              "Aseo genital previo.",
              "Recolectar la segunda orina de la mañana (chorro medio).",
              "Entregar la muestra antes de 1 hora.",
            ],
          },
          {
            name: "Orina Completa",
            deliveryTime: "1 día",
            requiresFasting: false,
            instructions: ["Recolectar la primera orina de la mañana, chorro medio."],
          },
        ],
      },
    ],
  },
  {
    name: "Imagenología",
    division: "Diagnóstica",
    description:
      "Centro de diagnóstico por imágenes con resonancia, scanner, ecografías y más.",
    categories: [
      {
        name: "Resonancia Magnética",
        exams: [
          {
            name: "Resonancia Magnética de Cerebro",
            code: "0405001",
            deliveryTime: "3 días",
            description:
              "Imagen detallada del cerebro sin radiación ionizante.",
            instructions: [
              "Informe si tiene marcapasos o implantes metálicos.",
              "Retire objetos metálicos antes del examen.",
            ],
          },
        ],
      },
      {
        name: "Ecografía",
        exams: [
          {
            name: "Ecotomografía Abdominal",
            deliveryTime: "1 día",
            requiresFasting: true,
            description:
              "Imágenes de órganos abdominales mediante ultrasonido. Sin contraindicaciones.",
            instructions: ["Ayuno de 6 a 8 horas."],
          },
        ],
      },
    ],
  },
  {
    name: "Procedimientos",
    division: "Procedimientos",
    categories: [
      {
        name: "Cardiología",
        exams: [
          {
            name: "Electrocardiograma (ECG)",
            deliveryTime: "1 día",
            requiresFasting: false,
            description:
              "Registra la actividad eléctrica del corazón para evaluar ritmo y función.",
          },
          {
            name: "Holter de Presión y Arritmia",
            deliveryTime: "2 días",
            requiresFasting: false,
            description: "Monitoreo de presión y ritmo cardíaco durante 24 horas.",
          },
        ],
      },
    ],
  },
];

// ───────────────────────── Sucursales ─────────────────────────

const BRANCHES = [
  {
    name: "Providencia",
    address: "José Manuel Infante 146",
    city: "Providencia, Santiago",
    phone: "+56226112700",
    email: "call-center@labocenter.cl",
  },
  {
    name: "Rancagua",
    address: "Astorga 145",
    city: "Rancagua",
    phone: "+56226112700",
    email: "call-center@labocenter.cl",
  },
];

async function seedPermissionsAndRoles() {
  // Permisos.
  for (const code of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: { code },
    });
  }

  // Roles + vínculos rol-permiso.
  for (const name of ROLE_NAMES) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    const codes = ROLE_PERMISSIONS[name as RoleName];
    const permissions = await prisma.permission.findMany({
      where: { code: { in: [...codes] } },
      select: { id: true },
    });

    await prisma.rolePermission.createMany({
      data: permissions.map((p) => ({
        roleId: role.id,
        permissionId: p.id,
      })),
      skipDuplicates: true,
    });
  }
}

async function seedAdmin() {
  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: "ADMIN" },
  });
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@labocenter.cl";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin1234!";
  const passwordHash = await hash(password);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      firstName: "Administrador",
      lastName: "Labocenter",
      roleId: adminRole.id,
      emailVerified: new Date(),
    },
  });

  return { email, password };
}

async function seedBranches() {
  for (const b of BRANCHES) {
    const slug = slugify(b.name);
    await prisma.branch.upsert({
      where: { slug },
      update: { address: b.address, city: b.city, phone: b.phone, email: b.email },
      create: { ...b, slug },
    });
  }
}

async function seedCatalog() {
  for (const service of CATALOG) {
    const serviceRow = await prisma.service.upsert({
      where: { slug: slugify(service.name) },
      update: { division: service.division, description: service.description },
      create: {
        name: service.name,
        slug: slugify(service.name),
        division: service.division,
        description: service.description,
      },
    });

    for (const category of service.categories) {
      const categoryRow = await prisma.examCategory.upsert({
        where: { slug: slugify(`${service.name}-${category.name}`) },
        update: { name: category.name, serviceId: serviceRow.id },
        create: {
          name: category.name,
          slug: slugify(`${service.name}-${category.name}`),
          serviceId: serviceRow.id,
        },
      });

      for (const exam of category.exams) {
        const examRow = await prisma.exam.upsert({
          where: { slug: slugify(exam.name) },
          update: {
            name: exam.name,
            code: exam.code,
            deliveryTime: exam.deliveryTime,
            requiresFasting: exam.requiresFasting ?? false,
            priceReference: exam.priceReference,
            description: exam.description,
            categoryId: categoryRow.id,
          },
          create: {
            name: exam.name,
            slug: slugify(exam.name),
            code: exam.code,
            deliveryTime: exam.deliveryTime,
            requiresFasting: exam.requiresFasting ?? false,
            priceReference: exam.priceReference,
            description: exam.description,
            categoryId: categoryRow.id,
          },
        });

        // Reemplaza las indicaciones para mantener idempotencia.
        await prisma.examInstruction.deleteMany({ where: { examId: examRow.id } });
        if (exam.instructions?.length) {
          await prisma.examInstruction.createMany({
            data: exam.instructions.map((content, i) => ({
              examId: examRow.id,
              step: i + 1,
              content,
            })),
          });
        }
      }
    }
  }
}

async function main() {
  console.log("🌱 Sembrando base de datos...");
  await seedPermissionsAndRoles();
  console.log("  ✓ Permisos y roles");
  const admin = await seedAdmin();
  console.log(`  ✓ Admin: ${admin.email} / ${admin.password}`);
  await seedBranches();
  console.log("  ✓ Sucursales");
  await seedCatalog();
  console.log("  ✓ Catálogo de servicios y exámenes");
  console.log("✅ Seed completado.");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
