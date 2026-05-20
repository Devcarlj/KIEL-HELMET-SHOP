import React from 'react'
import { Link } from 'react-router-dom'
import { FaFacebook, FaMapMarkerAlt, FaEnvelope, FaStar, FaHeart, FaShieldAlt, FaMotorcycle } from 'react-icons/fa'
import { GiFullMotorcycleHelmet } from 'react-icons/gi'
import logo from '../assets/KielHelmetShop2.png'

const GOOGLE_MAPS_EMBED =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d482.5!2d120.9668!3d14.4329!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDI1JzU4LjQiTiAxMjDCsDU4JzAwLjUiRQ!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph'

const GOOGLE_MAPS_LINK =
  'https://www.google.com/maps/search/?api=1&query=Phase+1+Cherry+Homes+B24+L12+A.+Bonifacio+St+Mambog+1+Bacoor+Cavite'

const stats = [
  { icon: <FaStar className="text-brand-secondary text-3xl" />, value: '30+', label: 'Happy Riders' },
  { icon: <FaShieldAlt className="text-brand-secondary text-3xl" />, value: '50+', label: 'Premium Products' },
  { icon: <FaHeart className="text-brand-secondary text-3xl" />, value: '5★', label: 'Customer Rating' },
  { icon: <FaMotorcycle className="text-brand-secondary text-3xl" />, value: '100%', label: 'Rider Focused' },
]

const values = [
  {
    icon: <FaShieldAlt className="text-brand-secondary text-2xl" />,
    title: 'Safety First',
    desc: 'Every helmet we carry meets strict safety standards. We believe no ride is worth risking your life over.',
  },
  {
    icon: <GiFullMotorcycleHelmet className="text-brand-secondary text-2xl" />,
    title: 'Premium Quality',
    desc: 'We handpick only the best brands and models — from full-face to open-face helmets for every type of rider.',
  },
  {
    icon: <FaHeart className="text-brand-secondary text-2xl" />,
    title: 'Built for Riders',
    desc: 'We are riders ourselves. Our passion for the road drives every product decision we make.',
  },
]

const AboutUs = () => {
  return (
    <section className="bg-brand-cream min-h-screen">

      {/* ── Hero Banner ── */}
      <div className="relative bg-brand-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #E66E33 0%, transparent 60%), radial-gradient(circle at 80% 20%, #E66E33 0%, transparent 50%)' }}
        />
        <div className="relative z-10 w-full px-4 md:px-10 lg:px-16 py-20 md:py-28 flex flex-col items-center text-center gap-6">
          <img src={logo} alt="Kiel Helmet Shop" className="h-20 w-auto brightness-110 drop-shadow-lg" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-cream leading-tight tracking-tight">
            About <span className="text-brand-secondary">Us</span>
          </h1>
          <p className="text-brand-cream/80 text-base md:text-lg max-w-2xl leading-relaxed">
            Your ultimate destination for premium quality helmets and riding gear in Bacoor, Cavite.
            Gear up for your next adventure with safety and style.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            <a
              href="https://www.facebook.com/people/KIEL-Helmet-SHOP/100092575211604/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-brand-secondary px-5 py-2.5 rounded-full font-bold text-white hover:bg-brand-secondary-dark transition-all transform hover:-translate-y-1 active:scale-95 shadow-lg"
            >
              <FaFacebook className="text-lg" />
              Follow on Facebook
            </a>
            <Link
              to="/"
              className="flex items-center gap-2 bg-brand-cream/10 border border-brand-cream/30 px-5 py-2.5 rounded-full font-bold text-brand-cream hover:bg-brand-cream/20 transition-all transform hover:-translate-y-1 active:scale-95"
            >
              Shop Now →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="bg-white border-b border-brand-cream-dark shadow-sm">
        <div className="w-full px-4 md:px-10 lg:px-16 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-2 text-center group">
                <div className="transform group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
                <span className="text-3xl font-extrabold text-brand-primary">{s.value}</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Our Story ── */}
      <div className="w-full px-4 md:px-10 lg:px-16 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="flex-1">
              <span className="inline-block bg-brand-secondary/10 text-brand-secondary font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Our Story
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-primary mb-6 leading-tight">
                Gear Up for Every <span className="text-brand-secondary">Adventure</span>
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  KIEL HELMET SHOP was born from a simple belief: every rider deserves top-quality protection
                  without compromising on style. Based in Bacoor, Cavite, we started as a passion project
                  by riders, for riders.
                </p>
                <p>
                  We offer a carefully curated collection of helmets and riding gear — from full-face helmets
                  to open-face, modular, and off-road options. Whether you're a daily commuter, a weekend
                  warrior, or a seasoned touring rider, we have the right gear for you.
                </p>
                <p>
                  Our mission is simple: keep you safe on every ride while making sure you look great doing it.
                  Every product we carry has been personally vetted for safety, quality, and value.
                </p>
              </div>
            </div>

            {/* Values */}
            <div className="flex-1 flex flex-col gap-5">
              <span className="inline-block bg-brand-secondary/10 text-brand-secondary font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-2 self-start">
                Our Values
              </span>
              {values.map((v, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-brand-cream-dark hover:shadow-md hover:border-brand-secondary/30 transition-all duration-300"
                >
                  <div className="bg-brand-secondary/10 p-3 rounded-xl flex-shrink-0">{v.icon}</div>
                  <div>
                    <h3 className="font-bold text-brand-primary mb-1">{v.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Visit Us / Map ── */}
      <div className="bg-brand-primary/5 border-t border-brand-cream-dark">
        <div className="w-full px-4 md:px-10 lg:px-16 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block bg-brand-secondary/10 text-brand-secondary font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Find Us
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-primary">
                Visit Our <span className="text-brand-secondary">Shop</span>
              </h2>
              <p className="text-gray-500 mt-3 text-sm md:text-base max-w-xl mx-auto">
                Come see our full collection in person. We'd love to help you find the perfect helmet!
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">

              {/* Contact Info Card */}
              <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-cream-dark">
                  <h3 className="font-bold text-brand-primary mb-4 text-lg">Contact & Location</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <FaMapMarkerAlt className="text-brand-secondary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm text-brand-text">Address</p>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          Phase 1, Cherry Homes, B24 L12<br />
                          A. Bonifacio St, Mambog 1<br />
                          Bacoor, Cavite, Philippines
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaEnvelope className="text-brand-secondary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm text-brand-text">Email</p>
                        <p className="text-sm text-gray-500">support@kielhelmet.shop</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaFacebook className="text-brand-secondary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm text-brand-text">Facebook</p>
                        <a
                          href="https://www.facebook.com/people/KIEL-Helmet-SHOP/100092575211604/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-brand-secondary hover:underline"
                        >
                          KIEL Helmet SHOP
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <a
                  href={GOOGLE_MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-brand-secondary text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-secondary-dark transition-all transform hover:-translate-y-1 active:scale-95 shadow-md text-sm"
                >
                  <FaMapMarkerAlt />
                  Open in Google Maps
                </a>
              </div>

              {/* Map Embed */}
              <div className="flex-1 w-full">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-brand-cream-dark hover:border-brand-secondary/40 transition-all duration-300 group">
                  {/* Clickable overlay that opens Google Maps */}
                  <a
                    href={GOOGLE_MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-brand-primary/20 backdrop-blur-[1px]"
                    aria-label="Open in Google Maps"
                  >
                    <span className="bg-white text-brand-primary font-bold px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-sm">
                      <FaMapMarkerAlt className="text-brand-secondary" />
                      Open in Google Maps
                    </span>
                  </a>
                  <iframe
                    title="Kiel Helmet Shop Location"
                    src={`https://maps.google.com/maps?q=Phase+1+Cherry+Homes+B24+L12+A.+Bonifacio+St+Mambog+1+Bacoor+Cavite+Philippines&t=&z=17&ie=UTF8&iwloc=&output=embed`}
                    width="100%"
                    height="420"
                    style={{ border: 0, display: 'block' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  🔍 Zoom in/out freely • Click the map to open in Google Maps
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="bg-brand-primary text-brand-cream py-14 px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Ready to Ride?</h2>
        <p className="text-brand-cream/70 mb-6 max-w-md mx-auto text-sm">
          Browse our full collection of helmets and riding gear. Stay safe, ride in style.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/"
            className="bg-brand-secondary hover:bg-brand-secondary-dark text-white font-bold px-8 py-3 rounded-full transition-all transform hover:-translate-y-1 active:scale-95 shadow-lg"
          >
            Shop Now
          </Link>
          <Link
            to="/"
            className="bg-brand-cream/10 border border-brand-cream/30 text-brand-cream font-bold px-8 py-3 rounded-full hover:bg-brand-cream/20 transition-all"
          >
            Go to Home
          </Link>
        </div>
      </div>

    </section>
  )
}

export default AboutUs
