'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Container, Center, Title, Text, Button, Paper, Group, Popover, TextInput, Modal, CloseButton, Textarea } from '@mantine/core';
import { IconCamera } from '@tabler/icons-react';
import Quagga from '@ericblade/quagga2';

export default function Commande() {
  const [formOpened, setFormOpened] = useState(false);
  const [result, setResult] = useState('');
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    quantite: '',
    isbn: '',
    description: '',
    image: '',
  });

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

      const onDetected = (data: any) => {
        if (data?.codeResult?.code) {
          setResult(data.codeResult.code);
          setFormData((prev) => ({
            ...prev,
            isbn: data.codeResult.code,
          }));
        }
      };
      Quagga.onDetected(onDetected);

      return () => {
        Quagga.stop();
        Quagga.offDetected(onDetected);
      };
    }
  }, [popoverOpened, scannerReady]);

  // ✅ CORRECTION: Utiliser e.target.name au lieu de e.target.title
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Soumission du formulaire avec validation
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des champs requis
    if (!formData.title.trim()) {
      alert("Le titre du livre est obligatoire !");
      return;
    }
    if (!formData.author.trim()) {
      alert("L'auteur est obligatoire !");
      return;
    }
    if (!formData.isbn.trim()) {
      alert("L'ISBN est obligatoire !");
      return;
    }

    try {
      // 1. Envoi des données à la table livre
      const livreRes = await fetch('/api/livre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          author: formData.author,
          isbn: Number(formData.isbn),
          description: formData.description || '',
        }),
      });

      if (!livreRes.ok) {
        const errorData = await livreRes.json();
        alert(`Erreur lors de l'ajout du livre: ${errorData.error || 'Erreur inconnue'}`);
        return;
      }

      // Récupère l'id du livre
      const livre = await livreRes.json();
      const livreId = livre.data?.id || livre.id;

      // 2. Envoi des données à la table inventaire
      const inventaireRes = await fetch('/api/inventaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,        // ✅ CORRECTION: Utiliser 'name' pour inventaire
          author: formData.author,
          quantite: Number(formData.quantite),
          price: Number(formData.price),
          livre_id: livreId,
        }),
      });

      if (!inventaireRes.ok) {
        const errorData = await inventaireRes.json();
        alert(`Erreur lors de l'ajout au stock: ${errorData.error || 'Erreur inconnue'}`);
        return;
      }

      alert("Livre et inventaire ajoutés avec succès !");
      setFormOpened(false);
      setFormData({ 
        title: '', 
        author: '', 
        price: '', 
        quantite: '', 
        isbn: '', 
        description: '', 
        image: '' 
      });
      setResult('');

    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion. Veuillez réessayer.');
    }
  };

  return (
    <Container size="sm" my={40}>
      {/* Modal du formulaire */}
      <Modal
        opened={formOpened}
        onClose={() => setFormOpened(false)}
        title="Ajouter ou incrémenter un livre"
        centered
        size="xl"
      >
        <form onSubmit={handleFormSubmit}>
          <TextInput
            label="ISBN"
            name="isbn"  
            value={formData.isbn}
            onChange={handleFormChange}
            required
            mb="md"
          />
          <TextInput
            label="Titre du livre"
            name="title"  
            value={formData.title}
            onChange={handleFormChange}
            required
            mb="md"
          />
          <TextInput
            label="Auteur"
            name="author"  
            value={formData.author}
            onChange={handleFormChange}
            required
            mb="md"
          />
          <Textarea
            label="Description"
            name="description" 
            value={formData.description}
            onChange={handleFormChange}
            minRows={2}
            mb="md"
          />
          <TextInput
            label="Prix"
            name="price" 
            value={formData.price}
            onChange={handleFormChange}
            required
            mb="md"
          />
          <TextInput
            label="Quantité"
            name="quantite" 
            value={formData.quantite}
            onChange={handleFormChange}
            required
            mb="md"
          />
          <Center h={100}>
            <Button type="submit">Ajouter / Incrémenter</Button>
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
                  setFormData((prev) => ({ ...prev, isbn: '' }));
                }}
                variant={popoverOpened ? 'outline' : 'filled'}
                leftSection={<IconCamera />}
              >
                {popoverOpened ? 'Désactiver la caméra' : 'Activer la caméra'}
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <CloseButton
                aria-label="Afficher le formulaire"
                onClick={() => {
                  setPopoverOpened(false);
                  setTimeout(() => setFormOpened(true), 200);
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
              <TextInput
                label="ISBN"
                name="isbn"  
                value={formData.isbn}
                onChange={handleFormChange}
                placeholder="Scanné ou à saisir manuellement"
                mt="md"
              />
            </Popover.Dropdown>
          </Popover>
        </Group>
        {!popoverOpened && result && (
          <Text mt="sm" color="teal" size="xl">
            ✅ ISBN détecté : {result}
          </Text>
        )}
        <Center mt="xl">
          <Button onClick={() => setFormOpened(true)}>
            Ajouter / Incrémenter un livre manuellement
          </Button>
        </Center>
      </Paper>
    </Container>
  );
}
