import { ChatVenster } from './venster';

export const metadata = { title: 'Assistent — Clover beheer' };

export default function ChatPagina() {
  return (
    <>
      <div className="kop">
        <div>
          <h1>Assistent</h1>
          <p>Beheer je vacatures door het gewoon op te schrijven.</p>
        </div>
      </div>
      <ChatVenster />
    </>
  );
}
