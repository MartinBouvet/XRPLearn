# Unblock: Bridging the Blockchain Gap

Only 7% of the world population uses blockchain technology. The rest feel excluded by complexity and jargon. **"Unblock"** aims to bridge this gap for the next generation.

We have built a facilitated workshop tool designed for high school classrooms. Unlike solitary e-learning platforms, Unblock is an interactive experience led by an instructor. Our solution solves the "abstraction problem" with a technological breakthrough: **The Dual-Reality Interface**.

- **Gamified Frontend:** Students engage with a fun, Kahoot-style interface where they unlock levels, earn badges, and trade items.
- **Real-Time Ledger:** Every in-game action (creating a profile, buying an item) triggers a real transaction on the XRPL Testnet visible on a simplified block explorer.

## Key Features

1.  **Learning by Doing:** Students create their own wallets and manage keys.
2.  **Financial Safety:** Raises awareness about the critical importance of private key management and digital hygiene in a safe environment.
3.  **Inclusivity:** Designed to appeal to everyone—girls and boys, coders and poets—demystifying Web3 beyond the "crypto-bro" stereotype.
4.  **Sustainable Model:** A B2B2C approach where Blockchain companies fund these workshops via CSR (Corporate Social Responsibility) budgets to train future talent.

---

## Technical Description

Unblock is built as a real-time web application leveraging the speed and efficiency of the XRP Ledger. It uses the **Scaffold-XRP** stack as a foundation.

### Architecture

The project follows a **Monorepo** architecture powered by **Turborepo**.

-   **Frontend:** [Next.js 14](https://nextjs.org/) & [Tailwind CSS](https://tailwindcss.com/) for a responsive, accessible UI (Split-screen design).
-   **Backend:** Node.js with WebSockets to synchronize the "Classroom State" between the Instructor Dashboard and Student Clients.
-   **Blockchain Integration:** We use `xrpl.js` to interact directly with the XRPL Testnet.
-   **Data Layer:** Redis (via `@vercel/kv`) is used for managing ephemeral game state and user sessions.

### XRPL Features Utilized

-   **Wallet Generation:** Programmatic creation of public/private key pairs for each student session.
-   **Payments:** Simulating transfers of value between students and NPCs.
-   **Issued Currencies (Trust Lines):** Handling the custom game tokens (Yellow/Red coins).
-   **NFTs (XLS-20):** Minting "Soulbound" achievement badges (Key Keeper, Architect) upon level completion.

### Why XRPL?

We specifically chose XRPL for its **3-second ledger close time** (essential for maintaining the flow of a live classroom) and its **Carbon Neutrality** (a mandatory requirement for educational institutions).

## Technologies Used

-   **Core Stack:** JavaScript / Node.js, Next.js 14, Turborepo, pnpm/npm
-   **Key Libraries:** `xrpl`, `xrpl-connect`, `swr`, `framer-motion`, `redis`

## Challenges Overcome

1.  **Real-Time Ledger Visualization:** Implemented a robust WebSocket listener to display live transactions without UI lag.
2.  **Interactive 3D Backgrounds:** Developed a custom `BlockchainBackground` component using CSS 3D transforms for high performance.
3.  **Game State Synchronization:** Utilized Redis for low-latency state sharing between the Admin (teacher) and Students.

---

## Quick Start (Developer Guide)

### Prerequisites

- Node.js 18+ and pnpm 8+ (or npm)

### Installation

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
scaffold-xrp/
├── apps/
│   └── web/                 # Next.js application (Unblock)
│       ├── app/             # Next.js App Router
│       ├── components/      # React components
│       └── lib/             # Utilities and configurations
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Networks

### Testnet (Used by Unblock)
- **WebSocket:** wss://s.altnet.rippletest.net:51233
- **Network ID:** 1
- **Faucet:** https://faucet.altnet.rippletest.net/accounts
- **Explorer:** https://testnet.xrpl.org

## Deployment

This project is deployed and hosted on [Vercel](https://xrp-learn.vercel.app/).

## License

MIT License - see LICENSE file for details
