import '../site.css';
import { Kop } from './kop';
import { Voet } from './voet';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="overslaan" href="#app">Direct naar de inhoud</a>
      <Kop />
      <main id="app">{children}</main>
      <Voet />
    </>
  );
}
