import Image from "next/image";

export default function Logo() {
  return (
    <div className="h-[40px] w-[120px] relative flex items-center gap-2">
      <Image src="/assets/logo.svg" alt="Logo" fill className="object-contain" />
    </div>
  );
}

