import Image from "next/image"

export default function KaviarenPage() {
  return (
    <div className="container section" style={{ maxWidth: 900 }}>
      <h1 className="headingPrimary">KAVIAREŇ</h1>

      <div style={{ position: "relative", width: "100%", height: 320, marginTop: 10, borderRadius: 12, overflow: "hidden" }}>
        <Image
          src="/galeria/kaviaren/zahrada.jpg"
          alt="Kaviareň Záhrada"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>

      <div style={{ marginTop: 20, lineHeight: 1.7, fontSize: 16 }}>
        <p>
          Kaviareň Záhrada vznikla na pôde novootvoreného Divadla Poprad. A to na mieste, kde boli kedysi kúpele,
          zájazdový hostinec a botanická záhrada Viliama Aurela Scherfela, známeho veľčianskeho botanika a lekárnika.
          Nadväzujeme na genius loci miesta, ktoré bolo v minulosti pokojnou oázou plnou stromov, rastlín a oddychu.
          Veríme, že Záhrada bude podobne ako Scherfelova botanická záhrada miestom, ktoré bude obľúbené a plné života
          - nielen z rastlín, ale aj ľudí, ktorí milujú skvelú kávu a napokon aj divadlo! Tu si v pokojnej atmosfére
          popri počúvaní starostlivo vyberaného jazzu vychutnáš šálku skvelej kávy či zákusok a nasaješ atmosféru divadla
          ešte predtým, než sa dvihne opona.
        </p>

        <p>
          <strong>Kaviareň Záhrada v Divadle Poprad sa nachádza na -1. podlaží so vstupom cez letnú scénu.</strong>
        </p>

        <h2 className="headingSecondary" style={{ marginTop: 30 }}>
          OTVÁRACIE HODINY
        </h2>

        <p>
          <strong>pondelok - piatok:</strong> 8:00 - 18:00<br />
          <strong>sobota - nedeľa:</strong> 9:00 - 18:00
        </p>

        <h2 className="headingSecondary" style={{ marginTop: 30 }}>
          DIVADLENÉ BARY
        </h2>

        <p>
          V čase konania predstavení sú pre vás k dispozícii <strong>2divadelné bary</strong>  pri veľkej sále a v štúdiu <strong>vždy 1 hodinu pred predstavením.</strong>
        </p>

        <p>
          Po predstavení v štúdiu vás radi obslúžime aj 1 hodinu po jeho skončení.
        </p>

        <h2 className="headingSecondary" style={{ marginTop: 30 }}>
          KONTAKT
        </h2>

        <p>
          ahoj@zahrada.cafe<br />
          +421 904 225 115
        </p>
      </div>
    </div>
  )
}