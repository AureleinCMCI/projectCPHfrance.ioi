'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Container, Center, Title, Text, Button, Paper, Group, Popover,
  TextInput, Modal, CloseButton, Textarea, Table, Loader, Checkbox
} from '@mantine/core';


import { IconCamera , IconEdit } from '@tabler/icons-react';
import Quagga from '@ericblade/quagga2';

type InventaireItem = {
  livre_id: number;
  title: string;
  author: string;
  quantite: number;
  price: number;
  isbn: number;
};

export default function   Resception() {
  // États pour le formulaire d'ajout
  const [formOpened, setFormOpened] = useState(false);
  const [result, setResult] = useState('');
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    quantite: '',
    isbn: '',
    description: '',
    image: '',
  });

  // États pour l'inventaire
  const [inventaire, setInventaire] = useState<InventaireItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // États pour la sélection de livres dans la modal
  const [opened, setOpened] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);

  // États pour la modal d'affichage des détails des livres sélectionnés
  const [detailsOpened, setDetailsOpened] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<InventaireItem[]>([]);

  // Pour mémoriser la quantité à ajouter pour chaque livre
  const [ajouts, setAjouts] = useState<{ [livre_id: number]: number }>({});

  // Pour mémoriser les livres sélectionnés et modifiables (notamment ISBN)
  const [editedBooks, setEditedBooks] = useState<InventaireItem[]>([]);

  // Callback ref pour scanner
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

  // Récupération de l'inventaire au chargement
  useEffect(() => {
    async function fetchInventaire() {
      setLoading(true);
      try {
        const response = await fetch('/api/inventaire', { method: 'GET' });
        const result = await response.json();
        setInventaire(result.data || []);
      } catch {
        setInventaire([]);
      } finally {
        setLoading(false);
      }
    }
    fetchInventaire();
  }, []);

  // Gestion du formulaire d'ajout
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const inventaireRes = await fetch('/api/inventaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: String(formData.title),
          author: String(formData.author),
          quantite: Number(formData.quantite),
          price: Number(formData.price),
          isbn: Number(formData.isbn)
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

      // Rafraîchir l'inventaire après ajout
      setLoading(true);
      const response = await fetch('/api/inventaire', { method: 'GET' });
      const result = await response.json();
      setInventaire(result.data || []);
      setLoading(false);

    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion. Veuillez réessayer.');
    }
  };

  // Gestion des cases à cocher
  const handleCheckbox = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Gestion de la soumission du formulaire de sélection
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Récupère les livres sélectionnés
    const books = filteredInventaire.filter(item => selected.includes(item.livre_id));
    setSelectedBooks(books);

    // Copie pour édition locale de l'ISBN
    setEditedBooks(books.map(book => ({ ...book })));

    // Réinitialise les ajouts à 0 pour chaque livre sélectionné
    const initialAjouts: { [livre_id: number]: number } = {};
    books.forEach(book => {
      initialAjouts[book.livre_id] = 0;
    });
    setAjouts(initialAjouts);

    setDetailsOpened(true);
    setOpened(false);
    setSelected([]);
  };

  // Gestion du changement de la quantité à ajouter
  const handleAjoutChange = (livre_id: number, value: string) => {
    setAjouts(prev => ({
      ...prev,
      [livre_id]: Number(value)
    }));
  };

  // Gestion du changement de l'ISBN
  const handleIsbnChange = (livre_id: number, newIsbn: string) => {
    setEditedBooks(prev =>
      prev.map(book =>
        book.livre_id === livre_id ? { ...book, isbn: Number(newIsbn) } : book
      )
    );
  };

  // Fonction pour incrémenter la quantité (utilise editedBooks pour l'ISBN modifié)
  const incrementInventaire = async (livre: InventaireItem, ajout: number) => {
    if (!ajout || ajout === 0) {
      alert("Veuillez saisir une quantité à ajouter supérieure à 0.");
      return;
    }
    try {
      setLoading(true);
      // On envoie l'ISBN modifié si besoin (tu peux adapter le backend si tu veux le mettre à jour)
      const res = await fetch('/api/ScannerResception', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livre_id: livre.livre_id, ajout, isbn: livre.isbn }),
      });
      if (!res.ok) throw new Error('Erreur lors de l’incrémentation');

      const response = await fetch('/api/inventaire', { method: 'GET' });
      const result = await response.json();
      setInventaire(result.data || []);
      setLoading(false);
      alert(`Quantité du livre "${livre.title}" incrémentée de ${ajout} !`);
    } catch (err) {
      setLoading(false);
      alert('Erreur lors de l’incrémentation');
    }
  };
  const updateIsbn = async (livre_id: number, isbn: number) => {
    try {
      const res = await fetch('/api/ScannerResception', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livre_id, isbn }),
      });
      if (!res.ok) throw new Error('Erreur lors de la mise à jour de l\'ISBN');
      // Optionnel : tu peux rafraîchir l’inventaire ici si besoin
      // await refreshInventaire();
      alert('ISBN mis à jour avec succès !');
    } catch (err) {
      alert('Erreur lors de la mise à jour de l\'ISBN');
    }
  };
  // Filtrage de l'inventaire selon la recherche
  const filteredInventaire = inventaire.filter((item) =>
    (item.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (item.author ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container size="sm" my={40}>
      {/* Modal du formulaire d'ajout */}
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

      {/* Bloc Scanner */}
      <Paper shadow="md" p="xl" radius="md" withBorder>
        <Title order={1} mb="md">
          Scanner un ISBN
        </Title>
        <Text color="dimmed" mb="lg">
          Place le code-barres ISBN du livre devant la caméra.
        </Text>
        <Group mt="md">
          <Popover
            width={350} position="bottom"
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
              <CloseButton aria-label="Afficher le formulaire"
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
              <Center >
              <Button aria-label="Afficher le formulaire"
                onClick={() => {
                  setPopoverOpened(false);
                  setTimeout(() => setFormOpened(true), 200);
                }}>
                validé
              </Button>
              </Center>
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

      {/* Liste des livres dans une modal de sélection */}
      <Button onClick={() => setOpened(true)} mt="xl">Sélectionner des livres</Button>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Sélectionner des livres" size="xl" centered>
        <form onSubmit={handleSubmit}>
          <Paper shadow="xs" p="md" mt="md" withBorder>
            <Title order={2} mb="md">
              Livres disponibles dans l'inventaire
            </Title>
            <TextInput
              placeholder="Rechercher par titre ou auteur"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              mb="md"
            />
            {loading ? (
              <Center>
                <Loader />
              </Center>
            ) : (
              <Table striped highlightOnHover>
                <thead>
                  <tr>
                    <th>Sélectionner</th>
                    <th>ID</th>
                    <th>Titre</th>
                    <th>Auteur</th>
                    <th>Quantité</th>
                    <th>Prix</th>
                    <th>ISBN</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventaire.map((item) => (
                    <tr key={item.livre_id}>
                      <td>
                        <Checkbox
                          checked={selected.includes(item.livre_id)}
                          onChange={() => handleCheckbox(item.livre_id)}
                        />
                      </td>
                      <td>{item.livre_id}</td>
                      <td>{item.title}</td>
                      <td>{item.author}</td>
                      <td>{item.quantite}</td>
                      <td>{item.price}</td>
                      <td>{item.isbn}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            {selected.length > 0 && (
              <Text mt="md" color="teal">
                Livres sélectionnés : {selected.join(', ')}
              </Text>
            )}
            <Group justify="center" mt="md">
              <Button type="submit" disabled={selected.length === 0}>
                Valider la sélection
              </Button>
            </Group>
          </Paper>
        </form>
      </Modal>

      {/* Modal d'affichage des informations des livres sélectionnés */}
      <Modal
        opened={detailsOpened}
        onClose={() => setDetailsOpened(false)}
        title="Informations du ou des livres sélectionnés"
        size="xl"
        centered
      >
        {editedBooks.length === 0 ? (
          <Text>Aucun livre sélectionné.</Text>
        ) : (
          editedBooks.map(book => (
            <Paper key={book.livre_id} shadow="xs" p="md" mb="md" withBorder>
              <TextInput label="Titre" value={book.title} readOnly mb="md" />
              <TextInput label="Auteur" value={book.author} readOnly mb="md" />
              <TextInput label="id" value={book.livre_id} readOnly mb="md" />
             <Group gap="xs" mb="md">
                <TextInput
                  label="ISBN"
                  value={book.isbn.toString()}
                  onChange={e => handleIsbnChange(book.livre_id, e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button
                  variant="subtle"
                  color="blue"
                  onClick={() => updateIsbn(book.livre_id, Number(book.isbn))}
                  title="Mettre à jour l'ISBN"
                  px={6}
                >
                  <IconEdit size={20} />
                </Button>
              </Group>
              <TextInput label="Quantité" value={book.quantite} readOnly mb="md" />
              <TextInput label="Prix" value={book.price.toString()} readOnly mb="md" />
              <TextInput
                label="Quantité à ajouter"
                type="number"
                value={ajouts[book.livre_id] ?? ''}
                onChange={e => handleAjoutChange(book.livre_id, e.target.value)}
                mb="md"
                min={1}
              />
              <Button
                mt="md"
                onClick={() => incrementInventaire(book, ajouts[book.livre_id] || 0)}
              >
                Valider (incrémenter la quantité)
              </Button>
            </Paper>
          ))
        )}
      </Modal>
    </Container>
  );
}
