# 03 · Diseño de Base de Datos (PostgreSQL + Prisma)

> Modelo de datos del dominio. Cada entidad responde a un caso de uso real del laboratorio y a hallazgos del [análisis](./01-analisis-sitio-actual.md).

## 1. Principios de modelado

- **Datos sensibles de salud**: el historial clínico y resultados se aíslan y su acceso se audita (Ley 19.628). 
- **IDs**: `cuid()` (no autoincrementales) para no filtrar volumen ni ser adivinables en URLs.
- **Soft delete** donde corresponde (`deletedAt`) para trazabilidad clínica/legal.
- **Timestamps** `createdAt`/`updatedAt` en todas las entidades de negocio.
- **Enums** para estados controlados (citas, pagos, roles).
- **Índices** en claves de búsqueda (RUT, email, fechas de agenda, slug de examen).
- **RUT chileno** normalizado (sin puntos, con dígito verificador) y único.

## 2. Diagrama entidad-relación (resumen)

```
User ─┬─< Session (refresh tokens)
      ├─── PatientProfile ──< MedicalRecord ──< MedicalRecordEntry
      ├─── DoctorProfile
      └─── StaffProfile
User >─── Role ──< RolePermission >── Permission

Branch ─┬─< Room ──< ScheduleSlot
        └─< Appointment

Service ─< ExamCategory ─< Exam ──< ExamInstruction
Appointment ─┬─< Order ──< OrderItem >── Exam
             └─── Patient(User)
Order ──< Result ──< ResultFile
Order ──< Payment
User ──< Notification
* ──< AuditLog   (polimórfico por entityType/entityId)
```

## 3. Roles del sistema

`ADMIN`, `RECEPTION`, `PATIENT`, `DOCTOR`, `MEDICAL_TECHNOLOGIST`. Detalle de permisos en [08-permisos.md](./08-permisos.md).

## 4. Esquema Prisma (`apps/api/prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ───────────────────────── Identidad y Acceso ─────────────────────────

enum RoleName {
  ADMIN
  RECEPTION
  PATIENT
  DOCTOR
  MEDICAL_TECHNOLOGIST
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  firstName     String
  lastName      String
  rut           String?   @unique          // RUT normalizado
  phone         String?
  isActive      Boolean   @default(true)
  emailVerified DateTime?
  lastLoginAt   DateTime?

  roleId String
  role   Role   @relation(fields: [roleId], references: [id])

  // Perfiles (1:1 según rol)
  patientProfile PatientProfile?
  doctorProfile  DoctorProfile?
  staffProfile   StaffProfile?

  sessions      Session[]
  notifications Notification[]
  auditLogs     AuditLog[]      @relation("ActorAudit")

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  @@index([rut])
  @@index([roleId])
}

model Role {
  id          String           @id @default(cuid())
  name        RoleName         @unique
  description String?
  users       User[]
  permissions RolePermission[]
  createdAt   DateTime         @default(now())
}

model Permission {
  id          String           @id @default(cuid())
  // formato "recurso:accion", p.ej. "appointment:create"
  code        String           @unique
  description String?
  roles       RolePermission[]
}

model RolePermission {
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
}

// Refresh tokens rotativos (hash) — ver 07-autenticacion.md
model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash    String   @unique            // hash del refresh token
  family       String                       // familia de rotación (detección de reuse)
  userAgent    String?
  ip           String?
  expiresAt    DateTime
  revokedAt    DateTime?
  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([family])
}

// ───────────────────────── Perfiles ─────────────────────────

model PatientProfile {
  id             String        @id @default(cuid())
  userId         String        @unique
  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  birthDate      DateTime?
  gender         String?
  address        String?
  insurance      InsuranceType @default(FONASA)
  insurancePlan  String?
  medicalRecord  MedicalRecord?
  appointments   Appointment[]
  orders         Order[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

enum InsuranceType {
  FONASA
  ISAPRE
  PARTICULAR
}

model DoctorProfile {
  id            String        @id @default(cuid())
  userId        String        @unique
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  specialty     String?
  licenseNumber String?       @unique       // N° de registro profesional
  appointments  Appointment[]
  scheduleSlots ScheduleSlot[]
  ordersCreated Order[]       @relation("OrderingDoctor")
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model StaffProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  position  String?  // recepción, tecnólogo médico, etc.
  branchId  String?
  branch    Branch?  @relation(fields: [branchId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ───────────────────────── Historial clínico ─────────────────────────

model MedicalRecord {
  id        String               @id @default(cuid())
  patientId String               @unique
  patient   PatientProfile       @relation(fields: [patientId], references: [id], onDelete: Cascade)
  entries   MedicalRecordEntry[]
  createdAt DateTime             @default(now())
  updatedAt DateTime             @updatedAt
}

model MedicalRecordEntry {
  id        String        @id @default(cuid())
  recordId  String
  record    MedicalRecord @relation(fields: [recordId], references: [id], onDelete: Cascade)
  authorId  String?       // usuario (médico/TM) que registró
  type      String        // nota, diagnóstico, resultado vinculado...
  title     String
  content   String
  createdAt DateTime      @default(now())

  @@index([recordId])
}

// ───────────────────────── Sucursales y agenda ─────────────────────────

model Branch {
  id            String         @id @default(cuid())
  name          String                          // Providencia, Rancagua
  slug          String         @unique
  address       String
  city          String
  phone         String?
  email         String?
  latitude      Float?
  longitude     Float?
  openingHours  Json?                            // horarios por día
  isActive      Boolean        @default(true)
  rooms         Room[]
  appointments  Appointment[]
  staff         StaffProfile[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Room {
  id        String         @id @default(cuid())
  branchId  String
  branch    Branch         @relation(fields: [branchId], references: [id], onDelete: Cascade)
  name      String                          // Box 1, Sala Resonancia...
  type      String                          // toma_muestra, imagen, consulta
  slots     ScheduleSlot[]
  createdAt DateTime       @default(now())

  @@index([branchId])
}

enum SlotStatus {
  AVAILABLE
  BOOKED
  BLOCKED
}

// Bloque de disponibilidad de agenda (médica o de exámenes)
model ScheduleSlot {
  id          String         @id @default(cuid())
  roomId      String
  room        Room           @relation(fields: [roomId], references: [id], onDelete: Cascade)
  doctorId    String?
  doctor      DoctorProfile? @relation(fields: [doctorId], references: [id])
  startAt     DateTime
  endAt       DateTime
  status      SlotStatus     @default(AVAILABLE)
  appointment Appointment?
  createdAt   DateTime       @default(now())

  @@index([roomId, startAt])
  @@index([doctorId, startAt])
  @@index([status, startAt])
}

// ───────────────────────── Catálogo de servicios y exámenes ─────────────────────────

model Service {
  id          String         @id @default(cuid())
  // División: Diagnóstica, Procedimientos, Apoyo/Laboratorio
  name        String
  slug        String         @unique
  division    String
  description String?
  icon        String?
  isActive    Boolean        @default(true)
  categories  ExamCategory[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

model ExamCategory {
  id        String   @id @default(cuid())
  serviceId String
  service   Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  name      String
  slug      String   @unique
  exams     Exam[]
  createdAt DateTime @default(now())

  @@index([serviceId])
}

model Exam {
  id              String            @id @default(cuid())
  categoryId      String
  category        ExamCategory      @relation(fields: [categoryId], references: [id])
  code            String?           @unique   // código FONASA p.ej. 0405001
  name            String
  slug            String            @unique
  description     String?
  deliveryTime    String?                      // "1 día", "5 días"
  requiresFasting Boolean           @default(false)
  priceReference  Int?                         // CLP referencial
  isActive        Boolean           @default(true)
  instructions    ExamInstruction[]
  orderItems      OrderItem[]
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@index([categoryId])
  @@index([name])
}

// Indicaciones/preparación en pantalla (resuelve UX-4)
model ExamInstruction {
  id        String   @id @default(cuid())
  examId    String
  exam      Exam     @relation(fields: [examId], references: [id], onDelete: Cascade)
  step      Int
  content   String
  createdAt DateTime @default(now())

  @@index([examId])
}

// ───────────────────────── Reservas / Citas ─────────────────────────

enum AppointmentType {
  MEDICAL        // hora médica
  EXAM           // toma de examen / imagen
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  CHECKED_IN
  COMPLETED
  CANCELLED
  NO_SHOW
}

model Appointment {
  id         String            @id @default(cuid())
  type       AppointmentType
  status     AppointmentStatus @default(PENDING)

  patientId  String
  patient    PatientProfile    @relation(fields: [patientId], references: [id])
  doctorId   String?
  doctor     DoctorProfile?    @relation(fields: [doctorId], references: [id])
  branchId   String
  branch     Branch            @relation(fields: [branchId], references: [id])

  slotId     String?           @unique
  slot       ScheduleSlot?     @relation(fields: [slotId], references: [id])

  scheduledAt DateTime
  notes       String?
  order       Order?

  createdAt  DateTime          @default(now())
  updatedAt  DateTime          @updatedAt
  deletedAt  DateTime?

  @@index([patientId])
  @@index([branchId, scheduledAt])
  @@index([status])
}

// ───────────────────────── Órdenes, resultados ─────────────────────────

enum OrderStatus {
  CREATED
  IN_PROCESS
  READY
  DELIVERED
  CANCELLED
}

model Order {
  id            String         @id @default(cuid())
  code          String         @unique          // folio visible
  patientId     String
  patient       PatientProfile @relation(fields: [patientId], references: [id])
  appointmentId String?        @unique
  appointment   Appointment?   @relation(fields: [appointmentId], references: [id])
  doctorId      String?
  doctor        DoctorProfile? @relation("OrderingDoctor", fields: [doctorId], references: [id])
  status        OrderStatus    @default(CREATED)
  items         OrderItem[]
  results       Result[]
  payment       Payment?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([patientId])
  @@index([status])
}

model OrderItem {
  id       String @id @default(cuid())
  orderId  String
  order    Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)
  examId   String
  exam     Exam   @relation(fields: [examId], references: [id])
  price    Int?

  @@index([orderId])
}

enum ResultStatus {
  PENDING
  VALIDATED
  PUBLISHED
}

model Result {
  id           String        @id @default(cuid())
  orderId      String
  order        Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
  status       ResultStatus  @default(PENDING)
  // Código público para verificación de autenticidad (reemplaza :8199)
  verificationCode String     @unique
  validatedById String?
  publishedAt   DateTime?
  files        ResultFile[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([orderId])
  @@index([verificationCode])
}

model ResultFile {
  id        String   @id @default(cuid())
  resultId  String
  result    Result   @relation(fields: [resultId], references: [id], onDelete: Cascade)
  fileName  String
  storageKey String                          // ruta en storage (no público directo)
  mimeType  String
  sizeBytes Int
  checksum  String?                          // integridad
  createdAt DateTime @default(now())

  @@index([resultId])
}

// ───────────────────────── Pagos (preparado Transbank) ─────────────────────────

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum PaymentProvider {
  MANUAL
  TRANSBANK         // integración futura
}

model Payment {
  id         String          @id @default(cuid())
  orderId    String          @unique
  order      Order           @relation(fields: [orderId], references: [id])
  amount     Int
  currency   String          @default("CLP")
  status     PaymentStatus   @default(PENDING)
  provider   PaymentProvider @default(MANUAL)
  externalId String?                          // token Webpay (futuro)
  paidAt     DateTime?
  createdAt  DateTime        @default(now())
  updatedAt  DateTime        @updatedAt
}

// ───────────────────────── Notificaciones ─────────────────────────

enum NotificationChannel {
  EMAIL
  SMS          // preparado
  WHATSAPP     // preparado
  IN_APP
}

enum NotificationStatus {
  QUEUED
  SENT
  FAILED
  READ
}

model Notification {
  id        String              @id @default(cuid())
  userId    String
  user      User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  channel   NotificationChannel
  status    NotificationStatus  @default(QUEUED)
  subject   String?
  body      String
  metadata  Json?
  sentAt    DateTime?
  readAt    DateTime?
  createdAt DateTime            @default(now())

  @@index([userId, status])
}

// ───────────────────────── Auditoría ─────────────────────────

model AuditLog {
  id         String   @id @default(cuid())
  actorId    String?
  actor      User?    @relation("ActorAudit", fields: [actorId], references: [id])
  action     String                           // "result.view", "patient.update"...
  entityType String
  entityId   String?
  ip         String?
  userAgent  String?
  metadata   Json?
  createdAt  DateTime @default(now())

  @@index([actorId])
  @@index([entityType, entityId])
  @@index([createdAt])
}
```

## 5. Migraciones y seed

- **Migraciones**: `prisma migrate dev` (desarrollo) / `prisma migrate deploy` (CI/prod). Cada cambio de esquema = una migración versionada en git.
- **Seed** (`prisma/seed.ts`): roles + permisos base, usuario admin inicial, sucursales (Providencia, Rancagua), divisiones/servicios y un set de exámenes de ejemplo migrados del sitio actual.

## 6. Integridad y rendimiento

- Índices compuestos en agenda (`roomId, startAt`) y citas (`branchId, scheduledAt`) para consultas de disponibilidad.
- Unicidad en `slotId` de `Appointment` evita doble reserva del mismo bloque (resuelve riesgo de solapamiento).
- `verificationCode` único e indexado para verificación pública de resultados.

> Continúa en [04-sistema-componentes.md](./04-sistema-componentes.md).
