'use client';

import { useAppKitAccount } from '@reown/appkit/react';
import { Wallet } from 'lucide-react';
import MultiSendForm from '@/components/MultiSendForm';
import styles from './page.module.css';

export default function Home() {
  const { isConnected } = useAppKitAccount();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.title}>EVM MultiSend</h1>
        <p className={styles.subtitle}>
          Send tokens to multiple addresses in one transaction across all EVM networks
        </p>
      </section>

      {!isConnected ? (
        <section className={styles.connectCard}>
          <div className={styles.connectIcon}>
            <Wallet size={48} strokeWidth={1.5} />
          </div>
          <h2 className={styles.connectTitle}>Connect Your Wallet</h2>
          <p className={styles.connectDescription}>
            Connect your wallet to start sending tokens to multiple addresses
          </p>
          <appkit-button />
        </section>
      ) : (
        <MultiSendForm />
      )}
    </div>
  );
}
