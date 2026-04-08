export default function ParkovaniePage() {
  return (
    <div className="container section" style={{ maxWidth: 900 }}>

      <h1 className="headingPrimary">
        PARKOVANIE
      </h1>

      <div style={{ lineHeight: 1.7, fontSize: 16 }}>

        <p>
          Divadlo Poprad sídli v zrekonštruovanej budove historickej časti Veľká.
          Vzhľadom na to, že rekonštrukciou budovy sa nemenil jej pôvodný účel,
          ktorým je kultúrno-verejná stavba, divadlo nemá zo zákona povinnosť
          zabezpečovať parkovacie miesta pre návštevníkov divadla.
        </p>

        <p>
          V jeho blízkosti sa však nachádza niekoľko možností, kde je možné parkovať:
        </p>

        <h2 className="headingSecondary" style={{ marginTop: 30 }}>
          MOŽNOSTI PARKOVANIA
        </h2>

        <ul style={{ marginTop: 10 }}>
          <li>Veľké námestie</li>
          <li>Scherfelova ulica</li>
        </ul>

      </div>
    </div>
  )
}