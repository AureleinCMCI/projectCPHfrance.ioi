import Hom from '../../../component/hom';

import Navbar from '../../../component/navbar'; // <-- Ajoute cette ligne

import style from '../../../component/style/login.module.css';


export default function HomPage() {
  return (
    <html>
      <body>
        <Navbar />
        <main>
          <Hom />
        </main>
      </body>
    </html>
  );
}
