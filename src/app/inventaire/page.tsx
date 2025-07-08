import Inventaire from '../../../component/inventaire';
import Navbar from '../../../component/navbar'; // <-- Ajoute cette ligne
import { Container} from '@mantine/core';

export default function LoginFrom() {
  return (
    <Container>
      <Navbar /> 
      <main>
        <Inventaire />
      </main>
    </Container>
  );
}
