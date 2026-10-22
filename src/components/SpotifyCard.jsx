const SpotifyCard = () => {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang];
  return (
    <div className="bg-[#1DB954] text-white p-5 rounded-2xl shadow-xl w-full max-w-sm mt-2 flex items-center gap-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
      <div className="relative z-10 w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center shadow-lg animate-[spin_4s_linear_infinite]">
        <Music className="text-[#1DB954]" size={28} />
      </div>
      <div className="relative z-10">
        <p className="text-xs uppercase tracking-wider font-semibold opacity-80 flex items-center gap-1">
          {t.spotify_title} <span className="flex gap-1 h-3"><span className="w-1 bg-white animate-pulse"></span><span className="w-1 bg-white animate-pulse delay-75"></span><span className="w-1 bg-white animate-pulse delay-150"></span></span>
        </p>
        <h3 className="font-bold text-lg leading-tight mt-1">Do I Wanna Know?</h3>
        <p className="text-sm opacity-90">Arctic Monkeys</p>
      </div>
    </div>
  );
};


export default SpotifyCard;
