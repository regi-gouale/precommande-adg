# Precommande ADG - Better Auth + Polar

Ce projet utilise exclusivement Better Auth pour l'authentification admin et le plugin officiel Polar pour le checkout, le customer portal et les webhooks.

## Installation

```bash
bun install
```

## Variables d'environnement

Copiez `.env.example` vers `.env` et renseignez:

```env
DATABASE_URL=
NEXT_PUBLIC_APP_URL=

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
POLAR_ENVIRONMENT=sandbox

POLAR_PRODUCT_BOOK_SINGLE=
POLAR_PRODUCT_BOOK_BONUS=
POLAR_PRODUCT_BOOK_PACK=

EMAIL_FROM=
RESEND_API_KEY=
```

## Configuration Better Auth

- Configuration centralisee serveur: `lib/auth.ts`
- Client Better Auth: `lib/auth-client.ts`
- Route handler Better Auth: `app/api/auth/[...all]/route.ts`

La configuration inclut:

- Email/mot de passe pour admin.
- Roles via plugin admin avec role `ADMIN`.
- Session securisee (expiration + refresh + cache cookie).
- Adaptateur Prisma PostgreSQL.

## Configuration Polar (plugin officiel Better Auth)

Le plugin `@polar-sh/better-auth` est configure dans `lib/auth.ts` avec:

- `polar(...)`
- `checkout(...)`
- `portal(...)`
- `webhooks(...)`

Le client serveur Polar (`@polar-sh/sdk`) utilise:

- `POLAR_ACCESS_TOKEN`
- `POLAR_ENVIRONMENT` (`sandbox` ou `production`)

Le token Polar n'est jamais expose cote client.

## Prisma

Generer le client et appliquer les migrations:

```bash
bun run prisma:generate
bun run prisma:migrate --name init
```

Schema principal: `prisma/schema.prisma`.

Le modele `User` est compatible Better Auth (sessions, accounts, role, banned, etc.).

## Creation du premier admin

Le script de bootstrap:

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='MotDePasseFort123!' ADMIN_NAME='Admin' bun run admin:create
```

Ce script:

- cree/met a jour l'utilisateur.
- force le role `ADMIN`.
- cree/met a jour le compte credential avec hash Better Auth.

## Protection admin

- Login: `/admin/login`
- Routes protegees: `/admin`, `/admin/orders`, `/admin/orders/[id]`, `/admin/offers`, `/admin/book`, `/admin/settings`
- Verification server-side user connecte + role `ADMIN` via helpers `lib/admin-auth.ts`.
- Les actions serveur admin (ex: changement de statut commande) verifient aussi le role `ADMIN`.

## Flux precommande (invite)

1. Le visiteur ouvre `/precommande`.
2. Il remplit prenom, nom, email, telephone optionnel, adresse, quantite, CGV.
3. Le serveur cree une commande locale `PENDING_PAYMENT`.
4. Le serveur declenche le checkout Polar via `auth.api.checkout` (plugin Better Auth + Polar).
5. Le checkout est relie a la commande locale via `referenceId` et `metadata.orderId`.
6. Paiement sur Polar.
7. Le webhook `onOrderPaid` confirme le paiement.
8. La commande locale passe a:
	- `paymentStatus = PAID`
	- `status = PREORDER_CONFIRMED`
	- `paidAt = now`
	- `polarOrderId`, `polarCheckoutId`
9. Une entree `OrderStatusHistory` est creee.
10. Email transactionnel de confirmation envoye.
11. La commande est visible dans `/admin/orders`.

Important: le checkout reste possible sans compte client (`authenticatedUsersOnly: false`).

## Webhook Polar

Endpoint géré par le plugin: `/polar/webhooks`.

Dans Polar:

- configurez ce webhook vers `${BETTER_AUTH_URL}/api/auth/polar/webhooks`.
- renseignez `POLAR_WEBHOOK_SECRET`.

Le projet journalise tous les evenements Polar dans `PolarEventLog` (audit + idempotence) et traite `order.paid` pour confirmer la commande.

## Sandbox vs Production

- `POLAR_ENVIRONMENT=sandbox` pour le test local.
- `POLAR_ENVIRONMENT=production` en prod.
- Les tokens, produits et webhooks sont separes entre sandbox et production.

## Test checkout local

1. Lancez l'app: `bun run dev`
2. Ouvrez `/precommande`
3. Soumettez le formulaire
4. Verifiez redirection checkout Polar
5. Finalisez le paiement sandbox

## Test webhooks local

1. Exposez votre app locale avec un tunnel HTTPS (ex: ngrok)
2. Configurez l'URL webhook Polar
3. Realisez un paiement test
4. Verifiez dans la base:
	- `Order.paymentStatus = PAID`
	- `Order.status = PREORDER_CONFIRMED`
	- `OrderStatusHistory`
	- `PolarEventLog`

## Deploiement

Checklist:

1. Variables d'environnement prod configurees.
2. `POLAR_ENVIRONMENT=production`.
3. Produits Polar production renseignes (`POLAR_PRODUCT_*`).
4. Webhook prod configure vers `${BETTER_AUTH_URL}/api/auth/polar/webhooks`.
5. Migration Prisma appliquee.
6. Compte admin cree et teste.

## Criteres d'acceptation

Le projet couvre les criteres suivants:

1. Better Auth installe et configure.
2. Connexion admin via Better Auth.
3. Routes admin protegees.
4. Role `ADMIN` verifie cote serveur.
5. Plugin Polar Better Auth installe.
6. Checkout Polar declenche via integration Better Auth + Polar.
7. Checkout invite possible.
8. Chaque checkout relie a une commande locale via `referenceId`/metadata.
9. Webhook Polar confirme les paiements.
10. Une commande payee passe automatiquement `PREORDER_CONFIRMED`.
11. Evenements Polar journalises pour eviter les doubles traitements.
12. L'admin visualise les commandes et change les statuts.
13. Email transactionnel envoye apres paiement confirme.
14. README documente setup Better Auth + Polar complet.
