interface CardsPageIntroProps {
  description: string;
  title: string;
}

export default function CardsPageIntro({
  description,
  title,
}: CardsPageIntroProps) {
  return (
    <div className="mb-10 text-center">
      <h1 className="text-[2rem] font-bold tracking-[0.01em] text-ink-heading sm:text-[2.15rem]">
        {title}
      </h1>
      <p className="mt-3 text-[1.125rem] font-bold tracking-[0.01em] text-brand">
        {description}
      </p>
    </div>
  );
}
