export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 font-primary">
      <main className="container mx-auto px-6 py-12">
        {/* Header con branding */}
        <header className="text-center mb-12">
          <h1 className="text-size-1000 font-heavy mb-6 bg-[image:var(--color-button-bg-gradient)] bg-clip-text text-transparent">
            SheHub Admin
          </h1>
          <p className="text-size-500 text-neutral-500 font-secondary">
            Testing SheHub Theme Configuration
          </p>
        </header>

        {/* Test de colores */}
        <section className="mb-12">
          <h2 className="text-size-700 font-heavy text-purple-500 mb-6">Colores Brand</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-[var(--color-card-shadow-default)] hover:shadow-[var(--color-card-shadow-hover)] transition-shadow duration-200 p-6">
              <div className="w-full h-16 bg-purple-500 rounded-lg mb-4"></div>
              <h3 className="font-heavy text-size-400">Primary Purple</h3>
              <p className="text-neutral-500 text-size-200">#7858ff</p>
            </div>
            <div className="bg-white rounded-lg shadow-[var(--color-card-shadow-default)] hover:shadow-[var(--color-card-shadow-hover)] transition-shadow duration-200 p-6">
              <div className="w-full h-16 bg-pink-500 rounded-lg mb-4"></div>
              <h3 className="font-heavy text-size-400">Secondary Pink</h3>
              <p className="text-neutral-500 text-size-200">#f83c85</p>
            </div>
            <div className="bg-white rounded-lg shadow-[var(--color-card-shadow-default)] hover:shadow-[var(--color-card-shadow-hover)] transition-shadow duration-200 p-6">
              <div className="w-full h-16 bg-orange-500 rounded-lg mb-4"></div>
              <h3 className="font-heavy text-size-400">Tertiary Orange</h3>
              <p className="text-neutral-500 text-size-200">#f76702</p>
            </div>
          </div>
        </section>

        {/* Test de fuentes */}
        <section className="mb-12">
          <h2 className="text-size-700 font-heavy text-purple-500 mb-6">Typography Test</h2>
          <div className="bg-white rounded-lg shadow-[var(--color-card-shadow-default)] hover:shadow-[var(--color-card-shadow-hover)] transition-shadow duration-200 p-6">
            <h3 className="text-size-600 font-heavy font-primary mb-4">
              Ubuntu Font (Primary) - Heading
            </h3>
            <p className="text-size-400 font-secondary mb-4">
              Nunito Font (Secondary) - Body text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <p className="text-size-300 text-neutral-500 font-primary">
              Ubuntu Regular - Smaller text for labels and descriptions.
            </p>
          </div>
        </section>

        {/* Test de botones */}
        <section className="mb-12">
          <h2 className="text-size-700 font-heavy text-purple-500 mb-6">Buttons Test</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-purple-500 hover:bg-purple-100 text-white hover:text-black px-6 py-3 rounded-lg font-medium transition-all duration-200">
              Primary Button
            </button>
            <button className="bg-white hover:bg-purple-100 text-black border border-purple-500 px-6 py-3 rounded-lg font-medium transition-all duration-200">
              Secondary Button
            </button>
            <button className="bg-[image:var(--color-button-bg-gradient)] text-white px-6 py-3 rounded-lg font-medium">
              Gradient Button
            </button>
          </div>
        </section>

        {/* Test de input */}
        <section className="mb-12">
          <h2 className="text-size-700 font-heavy text-purple-500 mb-6">Form Elements Test</h2>
          <div className="bg-white rounded-lg shadow-[var(--color-card-shadow-default)] hover:shadow-[var(--color-card-shadow-hover)] transition-shadow duration-200 p-6 max-w-md">
            <div className="mb-4">
              <label className="block text-size-300 font-medium mb-2">Email</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent" 
                placeholder="admin@shehub.com"
              />
            </div>
            <div className="mb-4">
              <label className="block text-size-300 font-medium mb-2">Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent" 
                placeholder="••••••••"
              />
            </div>
          </div>
        </section>

        {/* Test de animación */}
        <section>
          <h2 className="text-size-700 font-heavy text-purple-500 mb-6">Animation Test</h2>
          <div className="fade-in delay-200">
            <div className="bg-white rounded-lg shadow-[var(--color-card-shadow-default)] hover:shadow-[var(--color-card-shadow-hover)] transition-shadow duration-200 p-6">
              <p className="text-size-400">
                Esta card debería aparecer con fade-in animation!
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
