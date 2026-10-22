const GaloCard = () => {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang];
  return (
    <div className="bg-white text-black p-5 rounded-2xl shadow-xl w-full max-w-sm mt-2 border-4 border-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, #000 20px, #000 40px)' }}></div>
      <div className="relative z-10 flex items-center gap-3 mb-4">
        <Trophy className="text-black" size={24} />
        <h3 className="font-bold uppercase tracking-wider">{t.galo_title}</h3>
      </div>
      <div className="relative z-10 flex items-center justify-between bg-neutral-100 p-4 rounded-xl border border-neutral-300">
        <div className="text-center">
          <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold mb-1 mx-auto shadow-md">CAM</div>
          <p className="text-xs font-semibold">Galo</p>
        </div>
        <div className="text-center px-4">
          <p className="text-sm font-bold bg-black text-white px-3 py-1 rounded-full">21:30</p>
          <p className="text-xs text-neutral-500 mt-1 font-medium">Qua, 28/10</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-red-600 text-black rounded-full flex items-center justify-center font-bold mb-1 mx-auto shadow-md">FLA</div>
          <p className="text-xs font-semibold">Flamengo</p>
        </div>
      </div>
    </div>
  );
};

export default GaloCard;
