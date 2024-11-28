import '@fontsource/questrial' // Imports Questrial font

const Logo = ({ className = 'w-full' }: { className?: string }): JSX.Element => {
  return (
    <h1
      className={
        className + ' font-questrial text-4xl drop-shadow-logo tracking-tight text-neutral-950'
      }
    >
      elephanto
    </h1>
  )
}

export default Logo

export const HomeScreenCarousel = (): JSX.Element => {
  return (
    <div className="h-lvh w-full object-cover p-0 relative">
      <img
        src="src/assets/elephanto_1.webp"
        alt="Home Screen"
        className=" h-lvh w-full object-cover p-0"
      />
      <Logo className=" absolute bottom-0 left-0 p-8" />
    </div>
  )
}
