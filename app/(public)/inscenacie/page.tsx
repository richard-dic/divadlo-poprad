import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"

export default async function Page() {
  const inscenacie = await prisma.divadelnaInscenacia.findMany({
    where: {
      viditelna: true
    },
    orderBy: {
      datumPremiery: "desc"
    }
  })

  return (
    <>
      <div className="repertoarPage">
        <h1 className="headingPrimary">REPERTOÁR</h1>

        <div className="repertoarList">
          {inscenacie.map((item) => (
            <Link
              key={item.id}
              href={`/inscenacie/${item.id}`}
              className="repertoarLink"
            >
              <div className="repertoarCard">
                <div className="ageBadge">
                  {item.vekovaKategoria}
                </div>

                <div className="imageWrap">
                  <Image
                    src={item.coverImage || "/default.jpg"}
                    alt={item.nazov}
                    fill
                    className="coverImage"
                  />
                </div>

                <div className="contentWrap">
                  <h2 className="title">{item.nazov}</h2>

                  <div className="metaRow">
                    {item.rezia && <span>Réžia: {item.rezia}</span>}
                    {item.rezia && <span className="metaDivider">|</span>}
                    <span>Dĺžka {item.dlzkaMinut} minút</span>
                  </div>

                  <p className="annotation">{item.anotacia}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .repertoarPage {
              padding: 60px 40px;
              max-width: 1200px;
              margin: 0 auto;
            }

            .repertoarList {
              display: flex;
              flex-direction: column;
              gap: 30px;
            }

            .repertoarLink {
              text-decoration: none;
              color: inherit;
            }

            .repertoarCard {
              display: flex;
              gap: 20px;
              border-radius: 12px;
              background: white;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
              padding: 20px;
              position: relative;
              align-items: flex-start;
            }

            .ageBadge {
              position: absolute;
              top: 20px;
              right: 20px;
              background: var(--color-primary);
              color: white;
              font-weight: 700;
              width: 50px;
              height: 50px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 8px;
              z-index: 2;
            }

            .imageWrap {
              position: relative;
              width: 180px;
              height: 180px;
              aspect-ratio: 1 / 1;
              flex-shrink: 0;
            }

            .coverImage {
              object-fit: cover;
              border-radius: 10px;
            }

            .contentWrap {
              flex: 1;
            }

            .title {
              margin-top: 0;
              margin-bottom: 8px;
              font-size: 28px;
            }

            .metaRow {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 12px;
              font-size: 14px;
              color: #555;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              flex-wrap: wrap;
            }

            .metaDivider {
              display: inline-block;
            }

            .annotation {
              color: #777;
              line-height: 1.6;
              margin: 0;
            }

            @media (max-width: 768px) {
              .repertoarPage {
                padding: 40px 16px;
              }

              .repertoarCard {
                flex-direction: column;
                gap: 16px;
                padding: 16px;
              }

              .imageWrap {
                width: 100%;
                height: auto;
                aspect-ratio: 1 / 1;
              }

              .contentWrap {
                width: 100%;
              }

              .title {
                font-size: 24px;
                margin-bottom: 10px;
                padding-right: 60px;
              }

              .metaRow {
                gap: 8px;
                margin-bottom: 14px;
                font-size: 13px;
                line-height: 1.5;
              }
            }

            @media (max-width: 480px) {
              .imageWrap {
                width: 100%;
                height: auto;
                aspect-ratio: 1 / 1;
              }

              .title {
                font-size: 22px;
              }

              .metaDivider {
                display: none;
              }

              .metaRow {
                flex-direction: column;
                align-items: flex-start;
              }
            }
          `,
        }}
      />
    </>
  )
}