'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Container, Center, Title, Text, Button, Paper, Group, Popover,
  TextInput, Modal, CloseButton, Table, Loader
} from '@mantine/core';
import { IconCamera, IconEdit } from '@tabler/icons-react';
import Quagga from '@ericblade/quagga2';

// TypeScript type pour un item d'inventaire
type InventaireItem = {
  livre_id: number;
  title: string;
  author: string;
  isbn: string | number;
  quantite: number;
  price: number;
};

export default function Commande() {
  const [formOpened, setFormOpened] = useState(false);
  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    author: '',
    quantite: '',
    price: '',
  });
  const [isbnError, setIsbnError] = useState('');
  const [livreTrouve, setLivreTrouve] = useState<InventaireItem | null>(null);
  const [result, setResult] = useState('');
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = useRef<HTMLDivElement | null>(null);

  // États pour l'inventaire
  const [inventaire, setInventaire] = useState<InventaireItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Recherche
  const [search, setSearch] = useState('');

    // États pour la modal d'affichage des détails des livres sélectionnés
    const [detailsOpened, setDetailsOpened] = useState(false);
    const [editedBooks, setEditedBooks] = useState<InventaireItem[]>([]);
    const [ajouts, setAjouts] = useState<{ [livre_id: number]: number }>({});

  // Callback ref pour scanner
  const setScannerNode = useCallback((node: HTMLDivElement | null) => {
    scannerRef.current = node;
    setScannerReady(!!node);
  }, []);

  // Gestion du scanner avec Quagga
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

      Quagga.onDetected((data: any) => {
        if (data && data.codeResult && data.codeResult.code) {
          setResult(data.codeResult.code);
          handleIsbnChangeManual(data.codeResult.code);
          Quagga.stop();
          setPopoverOpened(false);
        }
      });

      return () => {
        Quagga.stop();
        Quagga.offDetected();
      };
    }
  }, [popoverOpened, scannerReady, inventaire]);

  // Charger l'inventaire au chargement du composant
  useEffect(() => {
    const fetchInventaire = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/inventaire', { method: 'GET' });
        const result = await response.json();
        setInventaire(result.data || []);
      } catch (err) {
        setInventaire([]);
      }
      setLoading(false);
    };
    fetchInventaire();
  }, []);

  // Handler pour la saisie ou le scan de l'ISBN (recherche live)
  const handleIsbnChangeManual = (isbn: string) => {
    setFormData((prev) => ({
      ...prev,
      isbn,
    }));

    if (isbn.length === 0) {
      setLivreTrouve(null);
      setIsbnError('');
      setFormData((prev) => ({
        ...prev,
        title: '',
        author: '',
        price: '',
        quantite: '',
        quantiteAVendre: '',
      }));
      return;
    }

    // Comparaison robuste (trim, suppression des espaces)
    const livre = inventaire.find(
      item =>
        item.isbn.toString().replace(/\s/g, '') === isbn.trim().replace(/\s/g, '')
    );
    if (livre) {
      setLivreTrouve(livre);
      setIsbnError('');
      setFormData((prev) => ({
        ...prev,
        title: livre.title,
        author: livre.author,
        price: livre.price.toString(),
        quantite: livre.quantite.toString(),
        // Ne touche pas à quantiteAVendre ici
      }));
    } else {
      setLivreTrouve(null);
      setIsbnError("Le livre n'est pas en stock !");
      setFormData((prev) => ({
        ...prev,
        title: '',
        author: '',
        price: '',
        quantite: '',
        quantiteAVendre: '',
      }));
    }
  };

  // Handler pour la saisie manuelle dans le champ ISBN
  const handleIsbnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleIsbnChangeManual(e.target.value);
  };

  // Handler pour les autres champs du formulaire (non ISBN)
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler pour la soumission du formulaire (incrémentation, si besoin)
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!livreTrouve) {
      alert("Le livre n'est pas en stock !");
      return;
    }
    // Ici, tu peux appeler ta logique d'ajout/incrémentation si besoin
    alert("Livre trouvé dans l'inventaire !");
    setFormOpened(false);
    setFormData({
      isbn: '',
      title: '',
      author: '',
      quantite: '',
      price: '',
    });
    setLivreTrouve(null);
    setIsbnError('');
  };

  // Décrémenter la quantité d'un livre
  const DecrementeInventaire = async (livre: InventaireItem, ajout: number) => {
    try {
      setLoading(true);
      const res = await fetch('/api/commande', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livre_id: livre.livre_id, ajout }),
      });
      if (!res.ok) throw new Error('Erreur lors de la décrémentation');
      // Attendre que l'inventaire soit bien rechargé avant de continuer
      await new Promise(resolve => setTimeout(resolve, 300));
      const response = await fetch('/api/inventaire', { method: 'GET' });
      const result = await response.json();
      setInventaire(result.data || []);
      setLoading(false);
      alert(`Quantité du livre "${livre.title}" décrémentée de ${ajout} !`);
    } catch (err) {
      setLoading(false);
      alert('Erreur lors de la décrémentation');
    }
  };

  // Filtrage de l'inventaire selon la recherche
  const filteredInventaire = inventaire.filter((item) =>
    (item.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (item.author ?? '').toLowerCase().includes(search.toLowerCase())
  );

  // Afficher les détails d'un livre
  const openBookDetails = (book: InventaireItem) => {
    setEditedBooks([book]);
    setDetailsOpened(true);
  };

  // Handler pour changer la quantité à vendre dans la modale de détail
  const handleAjoutChange = (livre_id: number, value: string) => {
    setAjouts((prev) => ({ ...prev, [livre_id]: Number(value) }));
  };

  // Handler pour mettre à jour l'ISBN côté serveur (modale détail)
  const updateIsbn = async (livre_id: number, isbn: number) => {
    try {
      const res = await fetch('/api/updateIsbn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livre_id, isbn }),
      });
      if (!res.ok) throw new Error('Erreur lors de la mise à jour de l\'ISBN');
      alert('ISBN mis à jour !');
    } catch (err) {
      alert('Erreur lors de la mise à jour de l\'ISBN');
    }
  };

  return (
    <Container size="sm" my={40}>
      {/* Modal du formulaire d'ajout/incrémentation */}
      <Modal opened={formOpened}
        onClose={() => setFormOpened(false)}
        title="Ajouter ou incrémenter un livre" centered size="xl">

        <form onSubmit={handleFormSubmit}>
          <TextInput label="ISBN" name="isbn" value={formData.isbn} onChange={handleIsbnChange} required error={isbnError} />
          {livreTrouve ? (
            <>
              <TextInput label="Titre du livre" name="title" value={formData.title} readOnly mb="md" />
              <TextInput label="Auteur" name="author" value={formData.author} readOnly mb="md" />
              <TextInput label="Prix" name="price" value={formData.price} readOnly mb="md" />
              <TextInput label="Quantité en stock" name="quantite" value={formData.quantite} readOnly mb="md" />

            </>
          ) : (
            isbnError && (
              <Text color="red" mb="md">{isbnError}</Text>
            )
          )}
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
                onChange={handleIsbnChange}
                placeholder="Scanné ou à saisir manuellement"
                mt="md"
              />
              <Center>
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

      <TextInput
        mt="lg"
        placeholder="Recherche par titre ou auteur"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <Center my="lg"><Loader /></Center>
      ) : (
        <Table mt="md" striped highlightOnHover>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Auteur</th>
              <th>ISBN</th>
              <th>Quantité</th>
              <th>Prix</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventaire.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <Text>Aucun livre trouvé.</Text>
                </td>
              </tr>
            ) : (
              filteredInventaire.map(book => (
                <tr key={book.livre_id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.isbn}</td>
                  <td>{book.quantite}</td>
                  <td>{book.price}</td>
                  <td>
                    <Button
                      size="xs"
                      variant="outline"
                      color="blue"
                      onClick={() => openBookDetails(book)}
                    >
                      Détails
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
