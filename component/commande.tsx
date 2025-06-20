'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Container, Center, Title, Text, Button, Paper, Group, Popover, TextInput, Modal, CloseButton } from '@mantine/core';
import { IconCamera } from '@tabler/icons-react';
import Quagga from '@ericblade/quagga2';

export default function Hom() {
  const [formOpened, setFormOpened] = useState(false);
  const [result, setResult] = useState('');
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = useRef<HTMLDivElement | null>(null);

  // Callback ref pour garantir que le conteneur est bien monté
  const setScannerNode = useCallback((node: HTMLDivElement | null) => {
    scannerRef.current = node;
    setScannerReady(!!node);
  }, []);


  // Initialisation Quagga seulement quand le conteneur est prêt
  useEffect(() => {
    if (popoverOpened && scannerReady && scannerRef.current) {
      Quagga.init({
        inputStream: {
          type: "LiveStream",
          target: scannerRef.current,
          constraints: { facingMode: "environment" },
        },
        decoder: { readers: ["ean_reader"] },
      }, (err) => {
        if (!err) Quagga.start();
      });

      type QuaggaDetectedData = {
        codeResult: {
          code: string;
          [key: string]: any; // pour inclure d'autres propriétés éventuelles
        };
        [key: string]: any;
      };

      return () => {
        Quagga.stop();
        Quagga.offDetected();
      };
    }
  }, [popoverOpened, scannerReady]);

  return (
    <Container size="sm" my={40}>
      {/* Modal du formulaire, placée en dehors du Popover */}
      <Modal
        opened={formOpened}
        onClose={() => setFormOpened(false)}
        title="Formulaire"
        centered
        size="xl"
      >
        <form>
          <TextInput label="Nom" required />
          <TextInput label="Ateur" required />
          <TextInput label="prix" required />
          <Center h={100}>
            <Button type="submit">PHOTO</Button>
          </Center>
        </form>
      </Modal>
      <Paper shadow="md" p="xl" radius="md" withBorder>
        <Title order={1} mb="md">
          Scanner un ISBN
        </Title>
        <Text color="dimmed" mb="lg">
          Place le code-barres ISBN du livre devant la caméra.
        </Text>
        <Group mt="md">
          <Popover
            width={350}
            position="bottom"
            withArrow
            shadow="md"
            opened={popoverOpened}
            onChange={setPopoverOpened}
            trapFocus
            withinPortal={false}
          >
            <Popover.Target>
              <Button
                color={popoverOpened ? 'red' : 'blue'}
                onClick={() => {
                  setResult('');
                  setPopoverOpened((o) => !o);
                }}
                variant={popoverOpened ? 'outline' : 'filled'}
              >
                {popoverOpened ? 'Désactiver la caméra' : 'Activer la caméra'}
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <CloseButton
                aria-label="Afficher le formulaire"
                onClick={() => {
                  setPopoverOpened(false);
                  setTimeout(() => setFormOpened(true), 200); // délai pour la transition
                }}
              />
              <div
                ref={setScannerNode}
                style={{
                  width: '100%',
                  maxWidth: 350,
                  height: 250,
                  margin: '0 auto',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: '#000'
                }}
              />
              <Text mt="sm" color="blue">
                {result ? `ISBN détecté : ${result}` : 'Scanne un code-barres ISBN de livre'}
              </Text>
              <TextInput label="ISBN" description="entre le code ISBN" />
            </Popover.Dropdown>
          </Popover>
        </Group>
        {!popoverOpened && result && (
          <Text mt="sm" color="teal" size="xl">
            ✅ ISBN détecté : {result}
          </Text>
        )}
      </Paper>
    </Container>
  );
}
