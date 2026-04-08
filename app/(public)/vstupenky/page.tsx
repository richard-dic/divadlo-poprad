export default function VstupenkyPage() {
  return (
    <div className="container section">
      <h1 className="headingPrimary">VSTUPENKY</h1>

      <p>
        V tejto sekcii nájdete všetky potrebné informácie pre pohodlný nákup
        vstupeniek na naše predstavenia.
      </p>

      <p>
        Aktuálny program, vrátane možnosti <b>online</b> nákupu vstupeniek,
        nájdete v sekcii <a href="/program" style={{ color: "var(--color-accent-light)", fontWeight: 600 }}>PROGRAM</a>.
      </p>

      <p>
        Vstupenky si môžete zakúpiť aj <b>osobne</b> na týchto predajných miestach:
      </p>

      <p>
        <b>Divadlo Poprad, Scherfelova 15, 058 01 Poprad</b><br />
        Foyer divadla, otvorené hodinu pred predstavením.<br />
        Telefón: <a href="tel:+421917069601" style={{ color: "var(--color-accent-light)" }}>+421 917 069 601</a>
      </p>

      <p>
        <b>Kníhkupectvo Christiania, Námestie svätého Egídia 3004/108, 058 01 Poprad</b><br />
        Telefón: <a href="tel:+421527722944" style={{ color: "var(--color-accent-light)" }}>+421 52/772 29 44</a><br />
        Počas otváracích hodín.
      </p>

      <p>
        Na týchto predajných miestach vám vždy radi pomôžeme s výberom predstavenia
        či poradíme s darčekom pre vašich blízkych. Môžete si tu kúpiť alebo
        vyzdvihnúť vstupenky.
      </p>

      <p>
        Vstupenky je možné zakúpiť elektronicky priebežne, najneskôr v deň pred
        konaním podujatia do 24.00 hod. V prípade, že si neviete zakúpiť vstupenku <b>online</b>, kontaktujte nás.
      </p>

      <p>
        Informácie a hromadné objednávky:<br />
        <a href="tel:+421917050602" style={{ color: "var(--color-accent-light)" }}>
          +421 917 050 602
        </a>
        {' '} (dostupné v pracovných dňoch od 10. do 16. hod.) alebo na{' '}
        <a href="mailto:info@divadlopoprad.sk" style={{ color: "var(--color-accent-light)" }}>
          info@divadlopoprad.sk
        </a>
      </p>
    </div>
  )
}