'use client';
import { Modal } from '@mantine/core';
import { IconBrandFacebook, IconBrandInstagram } from '@tabler/icons-react';
import { useState } from 'react';
import styles from './style/hom.module.css';

export default function Hom() {
  const [opened, setOpened] = useState(false);

  return (
    <div className={styles.homSection}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className={styles.backgroundVideo}
      >
        <source src="/galaxie.mp4" type="video/mp4" />
        Votre navigateur ne supporte pas la vidéo.
      </video>
      <section style={{ position: 'relative', zIndex: 1 }}>
        {/* Titre principal */}
        <h1 className={styles.homTitle}>
          <span>Les véhicules </span>
          <span>de </span>
          <span>demain...</span>
        </h1>

        {/* Cartes centrales */}
        <div className={styles.homAll}>
          <a
            className={`${styles.homCard} ${styles.lefter}`}
            href="https://codepen.io/Filet-Thomas/pen/JjrKLYL"
            target="_blank"
            rel="noopener noreferrer"
          >
            Support
          </a>
          <div
            className={`${styles.homCard} ${styles.center}`}
            onClick={() => setOpened(true)}
            style={{ cursor: 'pointer' }}
          >
            Pourquoi nous ?
          </div>
          <a
            className={`${styles.homCard} ${styles.righter}`}
            href="https://codepen.io/Filet-Thomas/pen/rNGMEmj"
            target="_blank"
            rel="noopener noreferrer"
          >
            Nos offres
          </a>
        </div>

        {/* Réseaux sociaux */}
        <ul className={styles.homMedias}>
          <li className={styles.homBulle}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <IconBrandFacebook size={40} color="white" />
            </a>
          </li>
          <li className={styles.homBulle}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <IconBrandInstagram size={40} color="white" />
            </a>
          </li>
        </ul>

        {/* Modale Mantine */}
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          centered
          title="Pourquoi nous choisir ?"
          overlayProps={{
            backgroundOpacity: 0.6,
            blur: 2,
          }}
          styles={{
            title: { fontFamily: 'Cinzel, serif', fontSize: 32, textAlign: 'center' },
            body: { fontFamily: 'Cinzel, serif', fontSize: 18, textAlign: 'center' },
          }}
        >
          <p>
            Nous sommes dans une ère en perpétuel progrès technologique. Le secteur automobile, l&apos; avionique, etc. n&apos;y échappera pas. C&apos;est pour cela que nous, DriveTech, vous proposons d&apos;investir dès maintenant dans les prototypes en cours.<br /><br />
            Pour vous renseigner sur les prototypes ou les véhicules déjà en vente, veuillez vous rendre dans l&apos;onglet &quot;Vos offres&quot;.
          </p>
        </Modal>
      </section>
    </div>
  );
}