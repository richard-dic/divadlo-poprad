import Image from "next/image"

export default function TatryDivider() {
  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        height: 120, // uprav podľa obrázka
        overflow: "hidden"
      }}
    >
      <Image
        src="/ui/tatry_bar_uzsie.png"
        alt="Tatry"
        fill
        priority
        style={{
          objectFit: "cover",
          objectPosition: "center bottom"
        }}
      />
    </div>
  )
}