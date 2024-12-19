import '@fontsource/questrial' // Imports Questrial font

const Logo = ({ className = 'w-full' }: { className?: string }): JSX.Element => {
  return (
    <div className={`flex flex-col tracking-tight text-neutral-950 font-questrial drop-shadow-logo ${className}`}>
      <h1 className="text-4xl">elephanto</h1>
      <p className="text-md text-neutral-950">alpha release</p>
    </div>
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
