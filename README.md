# Precommande ADG - Better Auth + Stripe

Ce projet utilise Better Auth pour l'authentification admin et le plugin officiel Stripe de Better Auth pour les événements de paiement. Le checkout de précommande passe par Stripe Checkout.

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

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

STRIPE_PRICE_BOOK_BONUS=

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

## Configuration Stripe (plugin officiel Better Auth)

Le plugin `@better-auth/stripe` est configure dans `lib/auth.ts` avec:

- `stripe(...)`
- `stripeClient`
- `stripeWebhookSecret`
- `onEvent(...)` pour confirmer les paiements Stripe

Le client serveur Stripe (`stripe`) est aussi utilise pour creer la session Stripe Checkout de precommande:

- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_BOOK_BONUS` (offre unique: livre + bonus)

La cle secrète Stripe n'est jamais exposee cote client.

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

1. Le visiteur ouvre `/preorder`.
2. Il remplit prenom, nom, email, telephone optionnel, adresse, quantite, CGV.
3. Le serveur cree une commande locale `PENDING_PAYMENT`.
4. Le serveur cree une session Stripe Checkout avec `stripe.checkout.sessions.create`.
5. La session est reliee a la commande locale via `metadata.orderId`.
6. Paiement sur Stripe.
7. Le webhook Stripe, traite par le plugin Better Auth, confirme le paiement.
8. La commande locale passe a:
	- `paymentStatus = PAID`
	- `status = PREORDER_CONFIRMED`
	- `paidAt = now`
	- identifiants de paiement Stripe stockes dans la commande
9. Une entree `OrderStatusHistory` est creee.
10. Email transactionnel de confirmation envoye.
11. La commande est visible dans `/admin/orders`.

Important: le checkout reste possible sans compte client.

## Webhook Stripe

Le plugin Stripe de Better Auth recoit les evenements Stripe via le webhook configure dans Stripe Dashboard.

Dans Stripe Dashboard, configurez le webhook avec `STRIPE_WEBHOOK_SECRET` puis laissez le callback `onEvent` de `lib/auth.ts` traiter `checkout.session.completed` et `payment_intent.succeeded`.

## Sandbox vs Production

- Les cles de test et production Stripe sont separees.
- Les price IDs Stripe sont separes entre environnements.

## Test checkout local

1. Lancez l'app: `bun run dev`
2. Ouvrez `/preorder` et remplissez le formulaire.
3. Soumettez le formulaire
4. Verifiez la redirection vers Stripe Checkout
5. Finalisez le paiement de test

## Test webhooks local

1. Exposez votre app locale avec un tunnel HTTPS (ex: ngrok)
2. Configurez le webhook Stripe vers le point de terminaison du plugin Better Auth
3. Realisez un paiement test
4. Verifiez dans la base:
	- `Order.paymentStatus = PAID`
	- `Order.status = PREORDER_CONFIRMED`
	- `OrderStatusHistory`
	- evenement Stripe traite par Better Auth

## Deploiement

Checklist:

1. Variables d'environnement prod configurees.
2. `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` configurees.
4. Price ID Stripe production renseigne (`STRIPE_PRICE_BOOK_BONUS`).
4. Webhook prod Stripe configure.
5. Migration Prisma appliquee.
6. Compte admin cree et teste.

## Criteres d'acceptation

Le projet couvre les criteres suivants:

1. Better Auth installe et configure.
2. Connexion admin via Better Auth.
3. Routes admin protegees.
4. Role `ADMIN` verifie cote serveur.
5. Plugin Stripe Better Auth installe.
6. Checkout Stripe declenche via Stripe Checkout.
7. Checkout invite possible.
8. Chaque checkout relie a une commande locale via `referenceId`/metadata.
9. Webhook Stripe confirme les paiements.
10. Une commande payee passe automatiquement `PREORDER_CONFIRMED`.
11. Evenements Stripe traites de facon idempotente.
12. L'admin visualise les commandes et change les statuts.
13. Email transactionnel envoye apres paiement confirme.
14. README documente setup Better Auth + Stripe complet.
