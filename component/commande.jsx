'use client';
import { useState, useRef, useEffect } from 'react';
import { Container, Title, Text, Button, Paper, Group } from '@mantine/core';
import Quagga from '@ericblade/quagga2';

export default function Hom() {
  const [result, setResult] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (cameraActive && scannerRef.current) {
      Quagga.init({
        inputStream: {
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            facingMode: "environment",
          },
        },
        decoder: {
          readers: ["ean_reader"], // Spécifique à l’ISBN/EAN-13
        },
      }, (err) => {
        if (!err) {
          Quagga.start();
        }
      });

      Quagga.onDetected((data) => {
        setResult(data.codeResult.code);
        Quagga.stop();
        setCameraActive(false);
      });

      return () => {
        Quagga.stop();
        Quagga.offDetected();
      };
    }
  }, [cameraActive]);

  const handleCameraToggle = () => {
    if (cameraActive) {
      setCameraActive(false);
    } else {
      setResult('');
      setCameraActive(true);
    }
  };

  return (
    <Container size="sm" my={40}>
      <Paper shadow="md" p="xl" radius="md" withBorder>
        <Title order={1} align="center" mb="md">
          Scanner un ISBN
        </Title>
        <Text align="center" color="dimmed" mb="lg">
          Place le code-barres ISBN du livre devant la caméra.
        </Text>
        <Group position="center" mt="md">
          <Button
            color={cameraActive ? 'red' : 'blue'}
            onClick={handleCameraToggle}
            variant={cameraActive ? 'outline' : 'filled'}
          >
            {cameraActive ? 'Désactiver la caméra' : 'Activer la caméra'}
          </Button>
        </Group>
        {cameraActive && (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <div
              ref={scannerRef}
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
          </div>
        )}
        {!cameraActive && result && (
          <Text mt="sm" color="teal" size="xl" weight={700} align="center">
            ✅ ISBN détecté : {result}
          </Text>
        )}
      </Paper>
    </Container>
  );
}
